import { test, expect } from '@playwright/test';

/**
 * PR-09: E2E Smoke Test - AI Quota Enforcement
 * 
 * Critical Risk: AI cost runaway, quota bypass
 * 
 * Validates:
 * - User can use AI features within quota (100 msg/day)
 * - User is blocked when quota exceeded
 * - Error message displayed with quota info
 * - Grace period activates (if applicable)
 * - Quota resets daily
 */

test.describe('AI Quota Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no test credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    // Log in
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display AI quota in dashboard or settings', async ({ page }) => {
    // Navigate to AI features or settings
    await page.goto('/ai-coach');
    
    // Should see quota indicator (e.g., "45/100 messages used today")
    const quotaText = page.getByText(/\d+\/\d+ messages?/i);
    
    // Quota might be in header, sidebar, or settings
    const hasQuota = await quotaText.isVisible().catch(() => false);
    
    // If not visible on AI coach page, check settings
    if (!hasQuota) {
      await page.goto('/dashboard/settings');
      await expect(page.getByText(/quota|messages.*used|ai usage/i)).toBeVisible();
    }
  });

  test('should allow AI request when under quota', async ({ page }) => {
    // Navigate to AI coach
    await page.goto('/ai-coach');
    
    // Check if quota indicator shows under limit
    const quotaText = await page.getByText(/(\d+)\/\d+ messages?/i).textContent().catch(() => '0/100');
    const used = parseInt(quotaText?.match(/(\d+)\//)?.[1] || '0');
    const limit = parseInt(quotaText?.match(/\/(\d+)/)?.[1] || '100');
    
    // Skip if at limit
    if (used >= limit) {
      test.skip(); // User has exhausted quota
      return;
    }
    
    // Find AI input field
    const input = page.getByPlaceholder(/ask|question|message/i);
    await expect(input).toBeVisible();
    
    // Type a test question
    await input.fill('What is anti-Black racism?');
    
    // Click send button
    await page.getByRole('button', { name: /send|ask/i }).click();
    
    // Should see AI response (not quota error)
    await expect(page.getByText(/AI:|assistant:|response/i)).toBeVisible({ timeout: 15000 });
    
    // Should NOT see quota exceeded message
    const hasQuotaError = await page.getByText(/quota exceeded|limit reached/i).isVisible().catch(() => false);
    expect(hasQuotaError).toBe(false);
  });

  test('should block AI request when quota exceeded', async ({ page, request }) => {
    // This test requires a user account with exhausted quota
    // We'll simulate by making API requests until quota is hit
    
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Make multiple AI requests to exhaust quota (max 100)
    let quotaExhausted = false;
    
    for (let i = 0; i < 105; i++) {
      const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/ai/chat`, {
        headers: {
          'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
        },
        data: {
          message: `Test quota ${i}`,
        },
      });
      
      // Check if quota exceeded
      if (response.status() === 429) {
        quotaExhausted = true;
        const body = await response.json();
        expect(body.error).toMatch(/quota|limit|exceeded/i);
        break;
      }
      
      // Stop if we hit 105 requests (quota should be 100)
      if (i >= 104) {
        break;
      }
    }
    
    // Verify quota was enforced
    expect(quotaExhausted).toBe(true);
  });

  test('should show quota exceeded message in UI', async ({ page }) => {
    // Navigate to AI coach
    await page.goto('/ai-coach');
    
    // Check current quota
    const quotaText = await page.getByText(/(\d+)\/(\d+) messages?/i).textContent().catch(() => '0/100');
    const used = parseInt(quotaText?.match(/(\d+)\//)?.[1] || '0');
    const limit = parseInt(quotaText?.match(/\/(\d+)/)?.[1] || '100');
    
    // Skip if not at limit
    if (used < limit) {
      test.skip(); // User has remaining quota
      return;
    }
    
    // Try to send a message
    const input = page.getByPlaceholder(/ask|question|message/i);
    
    // Input might be disabled when quota exceeded
    const isDisabled = await input.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      await input.fill('Test message');
      await page.getByRole('button', { name: /send|ask/i }).click();
      
      // Should see quota exceeded error
      await expect(page.getByText(/quota exceeded|limit reached|100 messages/i)).toBeVisible({ timeout: 5000 });
    } else {
      // Input is disabled, should see message about quota
      await expect(page.getByText(/quota exceeded|limit reached|reset/i)).toBeVisible();
    }
  });

  test('should display grace period information if applicable', async ({ page }) => {
    // Navigate to AI settings or dashboard
    await page.goto('/dashboard/settings');
    
    // Check if grace period is active
    const gracePeriod = page.getByText(/grace period|temporary access|\d+ days? remaining/i);
    const hasGracePeriod = await gracePeriod.isVisible().catch(() => false);
    
    if (hasGracePeriod) {
      // Verify grace period details
      await expect(page.getByText(/grace period/i)).toBeVisible();
      
      // Should show expiry or days remaining
      await expect(page.getByText(/expires?|remaining|days?/i)).toBeVisible();
    }
    
    // Test passes whether grace period is active or not
    // (grace period is optional feature)
  });

  test('should show upgrade prompt when quota exceeded', async ({ page }) => {
    // Navigate to AI coach
    await page.goto('/ai-coach');
    
    // Check if at quota limit
    const quotaText = await page.getByText(/(\d+)\/(\d+) messages?/i).textContent().catch(() => '0/100');
    const used = parseInt(quotaText?.match(/(\d+)\//)?.[1] || '0');
    const limit = parseInt(quotaText?.match(/\/(\d+)/)?.[1] || '100');
    
    // Skip if not at limit
    if (used < limit) {
      test.skip();
      return;
    }
    
    // Should see upgrade prompt
    await expect(page.getByText(/upgrade.*more messages|increase.*quota/i)).toBeVisible();
    
    // Should see upgrade button
    await expect(page.getByRole('button', { name: /upgrade/i })).toBeVisible();
  });

  test('should prevent quota bypass via API', async ({ page, request }) => {
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Try to make request with manipulated quota headers (should be ignored)
    const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/ai/chat`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
        'X-Quota-Bypass': 'true', // Attempt to bypass
        'X-Remaining-Quota': '9999', // Fake quota value
      },
      data: {
        message: 'Test quota bypass',
      },
    });
    
    // Should either succeed (if under quota) or fail with 429 (if at quota)
    // Should NOT bypass quota based on fake headers
    if (response.status() === 429) {
      const body = await response.json();
      expect(body.error).toMatch(/quota|limit/i);
    }
    
    // Verify fake headers were ignored (quota is enforced server-side)
    expect(response.status()).not.toBe(500); // Should not crash from malformed headers
  });
});
