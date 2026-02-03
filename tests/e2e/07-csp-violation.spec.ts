import { test, expect } from '@playwright/test';

/**
 * PR-09: E2E Smoke Test - CSP Violation Detection
 * 
 * Critical Risk: XSS attacks, CSP bypass, clickjacking
 * 
 * Validates:
 * - CSP header is present in responses
 * - Inline scripts without nonce are blocked
 * - Violations are reported to /api/csp-report
 * - Violations trigger monitoring alerts
 * - CSP report-only mode can be toggled (kill switch)
 */

test.describe('CSP Violation Detection', () => {
  test('should have CSP header in all responses', async ({ page }) => {
    // Navigate to home page
    const response = await page.goto('/');
    
    // Get CSP header
    const cspHeader = response?.headers()['content-security-policy'];
    
    // CSP header should exist
    expect(cspHeader).toBeDefined();
    expect(cspHeader).toBeTruthy();
    
    // Should contain key directives
    expect(cspHeader).toContain("default-src 'self'");
    expect(cspHeader).toContain('script-src');
    expect(cspHeader).toContain("frame-ancestors 'none'");
    expect(cspHeader).toContain('report-uri');
  });

  test('should include nonce in script-src directive', async ({ page }) => {
    // Navigate to any page
    const response = await page.goto('/');
    
    // Get CSP header
    const cspHeader = response?.headers()['content-security-policy'];
    
    // Should contain nonce in script-src
    expect(cspHeader).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]+'/);
  });

  test('should inject nonce into script tags', async ({ page }) => {
    // Navigate to any page with scripts
    await page.goto('/');
    
    // Get all script tags
    const scripts = await page.locator('script').all();
    
    // At least one script should have nonce attribute
    let hasNonce = false;
    
    for (const script of scripts) {
      const nonce = await script.getAttribute('nonce');
      if (nonce) {
        hasNonce = true;
        // Nonce should be base64 (at least 16 chars)
        expect(nonce.length).toBeGreaterThanOrEqual(16);
        break;
      }
    }
    
    expect(hasNonce).toBe(true);
  });

  test('should block inline script without nonce', async ({ page }) => {
    // Create a test page with inline script (no nonce)
    const violations: string[] = [];
    
    // Listen for CSP violations in console
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        violations.push(msg.text());
      }
    });
    
    // Navigate to page
    await page.goto('/');
    
    // Try to inject inline script via DevTools (should be blocked)
    await page.evaluate(() => {
      try {
        // Attempt to inject inline script (CSP should block)
        const script = document.createElement('script');
        script.textContent = 'console.log("XSS attempt")';
        document.body.appendChild(script);
      } catch (e) {
        console.error('CSP blocked inline script');
      }
    });
    
    // Wait for violation to be logged
    await page.waitForTimeout(1000);
    
    // Should have CSP violation
    expect(violations.length).toBeGreaterThan(0);
  });

  test('should report violations to /api/csp-report', async ({ page, request }) => {
    // Skip if no API base URL
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }
    
    // Send a test CSP violation report
    const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/csp-report`, {
      headers: {
        'Content-Type': 'application/csp-report',
      },
      data: {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'referrer': '',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'",
          'disposition': 'enforce',
          'blocked-uri': 'inline',
          'status-code': 200,
          'script-sample': 'alert(1)',
        },
      },
    });
    
    // Should accept CSP reports (200 OK or 204 No Content)
    expect([200, 204]).toContain(response.status());
  });

  test('should display CSP violations in admin dashboard', async ({ page }) => {
    // Skip if no super admin credentials
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
    
    // Navigate to security dashboard (CSP violations)
    await page.goto('/admin/security/csp');
    
    // Should see CSP violations table or chart
    await expect(page.getByText(/violations|blocked|csp reports?/i)).toBeVisible();
  });

  test('should prevent clickjacking with frame-ancestors', async ({ page }) => {
    // Navigate to any page
    const response = await page.goto('/');
    
    // Get CSP header
    const cspHeader = response?.headers()['content-security-policy'];
    
    // Should have frame-ancestors 'none' (prevents embedding)
    expect(cspHeader).toContain("frame-ancestors 'none'");
    
    // Or check X-Frame-Options header (fallback)
    const xFrameOptions = response?.headers()['x-frame-options'];
    if (xFrameOptions) {
      expect(xFrameOptions).toMatch(/DENY|SAMEORIGIN/i);
    }
  });

  test('should block external scripts from untrusted domains', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Get CSP header
    const response = await page.goto('/');
    const cspHeader = response?.headers()['content-security-policy'];
    
    // script-src should NOT include 'unsafe-inline' or '*'
    const scriptSrc = cspHeader?.match(/script-src[^;]+/)?.[0] || '';
    
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toMatch(/script-src[^;]*\*/); // No wildcard
  });

  test('should allow whitelisted external resources', async ({ page }) => {
    // Navigate to page
    const response = await page.goto('/');
    
    // Get CSP header
    const cspHeader = response?.headers()['content-security-policy'];
    
    // Should allow trusted CDNs (e.g., Google Fonts, Stripe)
    const fontSrc = cspHeader?.match(/font-src[^;]+/)?.[0] || '';
    const connectSrc = cspHeader?.match(/connect-src[^;]+/)?.[0] || '';
    
    // Should allow Google Fonts
    expect(fontSrc).toContain('fonts.gstatic.com');
    
    // Should allow Supabase and Stripe
    expect(connectSrc).toContain('supabase.co');
    expect(connectSrc).toContain('stripe.com');
  });

  test('should enforce HTTPS for all resources', async ({ page }) => {
    // Navigate to page
    const response = await page.goto('/');
    
    // Get CSP header
    const cspHeader = response?.headers()['content-security-policy'];
    
    // Should have upgrade-insecure-requests
    expect(cspHeader).toContain('upgrade-insecure-requests');
    
    // Or block-all-mixed-content
    const hasMixedContentBlock = cspHeader?.includes('block-all-mixed-content');
    const hasUpgradeInsecure = cspHeader?.includes('upgrade-insecure-requests');
    
    expect(hasMixedContentBlock || hasUpgradeInsecure).toBe(true);
  });

  test('should rotate nonce on each request', async ({ page }) => {
    // Make first request
    await page.goto('/');
    
    // Get nonce from first request
    const scripts1 = await page.locator('script[nonce]').first();
    const nonce1 = await scripts1.getAttribute('nonce');
    
    // Reload page
    await page.reload();
    
    // Get nonce from second request
    const scripts2 = await page.locator('script[nonce]').first();
    const nonce2 = await scripts2.getAttribute('nonce');
    
    // Nonces should be different (rotating)
    expect(nonce1).not.toBe(nonce2);
  });

  test('should display CSP report-only mode toggle', async ({ page }) => {
    // Skip if no super admin credentials
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
    
    // Navigate to CSP settings
    await page.goto('/admin/security/csp/settings');
    
    // Should see report-only mode toggle (kill switch)
    const toggle = page.getByText(/report-only.*mode|report.*enforce|csp.*mode/i);
    await expect(toggle).toBeVisible();
  });
});
