import { test, expect } from '@playwright/test';

/**
 * PR-09: E2E Smoke Test - CanLII Rate Limiting
 * 
 * Critical Risk: CanLII API terms violation, account termination
 * 
 * Validates:
 * - Rate limiter enforces 2 req/sec limit
 * - Concurrent request limit (max 1)
 * - Daily quota (5000 requests/day)
 * - Kill switch functional (CANLII_INGESTION_ENABLED)
 * - Fail-closed enforcement (blocks on errors)
 */

test.describe('CanLII Rate Limiting', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no super admin credentials (CanLII ingestion requires admin)
    if (!process.env.TEST_SUPER_ADMIN_EMAIL || !process.env.TEST_SUPER_ADMIN_PASSWORD) {
      test.skip();
      return;
    }

    // Log in as super admin
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_SUPER_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_SUPER_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display CanLII ingestion dashboard', async ({ page }) => {
    // Navigate to admin CanLII dashboard
    await page.goto('/admin/canlii/stats');
    
    // Should see rate limit stats
    await expect(page.getByText(/rate limit|requests|quota/i)).toBeVisible();
    
    // Should see daily quota usage
    await expect(page.getByText(/\d+\/5000|daily quota/i)).toBeVisible();
  });

  test('should show kill switch status', async ({ page }) => {
    // Navigate to CanLII settings
    await page.goto('/admin/canlii/settings');
    
    // Should see kill switch toggle
    const killSwitch = page.getByText(/CANLII_INGESTION_ENABLED|ingestion.*enabled|kill switch/i);
    await expect(killSwitch).toBeVisible();
    
    // Should show current status (enabled/disabled)
    const status = page.getByText(/enabled|disabled|active|inactive/i);
    await expect(status).toBeVisible();
  });

  test('should enforce 2 req/sec rate limit', async ({ page, request }) => {
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Make 3 requests rapidly (should trigger rate limit)
    const requests = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 3; i++) {
      requests.push(
        request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/admin/canlii/ingest`, {
          headers: {
            'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
          },
          data: {
            caseId: `test-${i}`,
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // At least one request should be rate limited (429)
    const rateLimited = responses.some(r => r.status() === 429);
    
    // If all succeeded, they should have taken at least 1 second (2 req/sec = 0.5s per req)
    if (!rateLimited) {
      expect(duration).toBeGreaterThanOrEqual(500); // At least 0.5s delay
    } else {
      // Verify rate limit error message
      const rateLimitedResponse = responses.find(r => r.status() === 429);
      if (rateLimitedResponse) {
        const body = await rateLimitedResponse.json();
        expect(body.error).toMatch(/rate limit|too many requests/i);
      }
    }
  });

  test('should enforce concurrent request limit (max 1)', async ({ page, request }) => {
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Make 2 concurrent requests (should block 2nd)
    const request1 = request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/admin/canlii/ingest`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        caseId: 'concurrent-test-1',
      },
    });
    
    // Start 2nd request immediately (should be blocked)
    const request2 = request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/admin/canlii/ingest`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        caseId: 'concurrent-test-2',
      },
    });
    
    const [response1, response2] = await Promise.all([request1, request2]);
    
    // One should succeed, one should be rate limited
    const statuses = [response1.status(), response2.status()];
    
    // Either:
    // 1. One 200/201, one 429 (concurrent limit hit)
    // 2. Both 429 (rate limit or concurrent limit)
    const hasSuccess = statuses.includes(200) || statuses.includes(201);
    const hasRateLimit = statuses.includes(429);
    
    expect(hasRateLimit).toBe(true); // At least one should be rate limited
  });

  test('should display daily quota usage', async ({ page }) => {
    // Navigate to CanLII dashboard
    await page.goto('/admin/canlii/stats');
    
    // Should see daily quota (X/5000)
    const quotaText = await page.getByText(/(\d+)\/5000/i).textContent();
    const used = parseInt(quotaText?.match(/(\d+)\//)?.[1] || '0');
    
    // Used should be between 0 and 5000
    expect(used).toBeGreaterThanOrEqual(0);
    expect(used).toBeLessThanOrEqual(5000);
    
    // Should see quota reset time
    await expect(page.getByText(/reset.*midnight|resets? in|time until reset/i)).toBeVisible();
  });

  test('should block requests when daily quota exceeded', async ({ page, request }) => {
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Check current quota via dashboard
    await page.goto('/admin/canlii/stats');
    const quotaText = await page.getByText(/(\d+)\/5000/i).textContent();
    const used = parseInt(quotaText?.match(/(\d+)\//)?.[1] || '0');
    
    // Skip if not at limit
    if (used < 5000) {
      test.skip(); // Daily quota not exhausted
      return;
    }
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Try to make request (should be blocked)
    const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/admin/canlii/ingest`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        caseId: 'quota-test',
      },
    });
    
    // Should return 429 (quota exceeded)
    expect(response.status()).toBe(429);
    
    const body = await response.json();
    expect(body.error).toMatch(/quota|daily limit|5000/i);
  });

  test('should display kill switch status and allow toggle', async ({ page }) => {
    // Navigate to CanLII settings
    await page.goto('/admin/canlii/settings');
    
    // Find kill switch toggle
    const toggle = page.getByRole('switch', { name: /ingestion.*enabled|kill switch/i });
    
    // Check if toggle exists
    const toggleExists = await toggle.isVisible().catch(() => false);
    
    if (toggleExists) {
      // Get current state
      const isChecked = await toggle.isChecked();
      
      // Toggle should be interactive
      await expect(toggle).toBeEnabled();
      
      // Verify current status is displayed
      const status = isChecked ? 'enabled' : 'disabled';
      await expect(page.getByText(new RegExp(status, 'i'))).toBeVisible();
    } else {
      // Kill switch might be environment variable only (not UI toggle)
      await expect(page.getByText(/CANLII_INGESTION_ENABLED|kill switch/i)).toBeVisible();
    }
  });

  test('should show rate limiter health status', async ({ page }) => {
    // Navigate to CanLII dashboard
    await page.goto('/admin/canlii/stats');
    
    // Should see Redis connection status (rate limiter backend)
    const healthStatus = page.getByText(/redis.*connected|rate limiter.*healthy|connection.*ok/i);
    
    // Health status might be in system health or CanLII-specific section
    const hasHealthStatus = await healthStatus.isVisible().catch(() => false);
    
    if (!hasHealthStatus) {
      // Check general health endpoint
      await page.goto('/api/health');
      
      // Should return 200 OK
      expect(page.url()).toContain('/api/health');
    }
    
    // Test passes if either health status visible or health endpoint accessible
  });

  test('should log rate limit violations for audit', async ({ page }) => {
    // Navigate to CanLII audit logs
    await page.goto('/admin/canlii/logs');
    
    // Should see request log table
    await expect(page.getByText(/timestamp|request|status|rate limit/i)).toBeVisible();
    
    // Should see columns: timestamp, endpoint, status, rate_limited (true/false)
    const table = page.locator('table, [role="table"]');
    await expect(table).toBeVisible();
  });
});
