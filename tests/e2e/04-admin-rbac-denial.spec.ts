import { test, expect } from '@playwright/test';

/**
 * PR-09: E2E Smoke Test - Admin RBAC Denial
 * 
 * Critical Risk: Unauthorized access to admin panel, privilege escalation
 * 
 * Validates:
 * - Non-admin users cannot access /admin routes
 * - Middleware redirects unauthorized users
 * - Admin-only UI elements hidden from non-admins
 * - API returns 403 for non-admin requests
 */

test.describe('Admin RBAC Denial', () => {
  test('should block non-admin from /admin route (middleware)', async ({ page }) => {
    // Skip if no regular user credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    // Log in as regular user (non-admin)
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Try to access admin panel
    await page.goto('/admin');
    
    // Should be redirected away from /admin (to dashboard or 403 page)
    await page.waitForURL(/\/(dashboard|403|auth\/login)/, { timeout: 5000 });
    expect(page.url()).not.toContain('/admin');
    
    // Should see error message or dashboard
    const hasErrorMessage = await page.getByText(/unauthorized|forbidden|no access/i).isVisible().catch(() => false);
    const hasDashboard = await page.getByText(/dashboard/i).isVisible().catch(() => false);
    expect(hasErrorMessage || hasDashboard).toBe(true);
  });

  test('should hide admin navigation for non-admin users', async ({ page }) => {
    // Skip if no regular user credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    // Log in as regular user
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Admin navigation should not be visible
    const adminLink = page.getByRole('link', { name: /admin panel|administration/i });
    await expect(adminLink).not.toBeVisible();
  });

  test('should allow super admin access to /admin', async ({ page }) => {
    // Skip if no super admin credentials available
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
    
    // Navigate to admin panel
    await page.goto('/admin');
    
    // Should stay on /admin route
    await expect(page).toHaveURL(/\/admin/);
    
    // Should see admin content
    await expect(page.getByText(/admin|dashboard|users|organizations/i)).toBeVisible();
  });

  test('should block API requests from non-admin users', async ({ page, request }) => {
    // Skip if no regular user credentials or API base URL
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD || !process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }

    // Log in as regular user
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Try to access admin API endpoint
    const response = await request.get(`${process.env.PLAYWRIGHT_BASE_URL}/api/admin/users`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    });
    
    // Should return 403 Forbidden
    expect(response.status()).toBe(403);
    
    // Response should contain error message
    const body = await response.json();
    expect(body.error).toMatch(/unauthorized|forbidden|admin/i);
  });

  test('should allow org admin access to org settings but not platform admin', async ({ page }) => {
    // Skip if no org admin credentials available
    if (!process.env.TEST_ORG_ADMIN_EMAIL || !process.env.TEST_ORG_ADMIN_PASSWORD) {
      test.skip();
      return;
    }

    // Log in as org admin
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_ORG_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_ORG_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Should be able to access org settings
    await page.goto('/org/settings');
    await expect(page).toHaveURL(/\/org\/settings/);
    await expect(page.getByText(/organization|settings/i)).toBeVisible();
    
    // Should NOT be able to access platform admin
    await page.goto('/admin');
    await page.waitForURL(/\/(dashboard|403|auth\/login)/, { timeout: 5000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('should prevent privilege escalation via role manipulation', async ({ page, request }) => {
    // Skip if no regular user credentials
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD || !process.env.PLAYWRIGHT_BASE_URL) {
      test.skip();
      return;
    }

    // Log in as regular user
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Get auth cookie
    const cookies = await page.context().cookies();
    
    // Try to promote self to admin via API (should fail)
    const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/user/update-role`, {
      headers: {
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        role: 'super_admin',
      },
    });
    
    // Should return 403 or 404 (endpoint doesn't exist for self-promotion)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
