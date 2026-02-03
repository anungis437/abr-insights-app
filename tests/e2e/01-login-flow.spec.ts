import { test, expect } from '@playwright/test';

/**
 * PR-09: E2E Smoke Test - Login Flow
 * 
 * Critical Risk: Authentication bypass, session hijacking
 * 
 * Validates:
 * - User can log in with valid credentials
 * - Invalid credentials are rejected
 * - Session is created and persisted
 * - User is redirected to dashboard after login
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    // Navigate to login
    await page.goto('/auth/login');
    
    // Expect login form to be visible
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Click sign in
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Expect error message
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should log in with valid credentials', async ({ page }) => {
    // Skip if no test credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    await page.goto('/auth/login');
    
    // Fill in valid credentials
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    
    // Click sign in
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Should see user profile or dashboard content
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should persist session after page reload', async ({ page }) => {
    // Skip if no test credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    await page.goto('/auth/login');
    
    // Log in
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in (no redirect to login)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should log out successfully', async ({ page }) => {
    // Skip if no test credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
      return;
    }

    await page.goto('/auth/login');
    
    // Log in
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Click logout button (adjust selector based on your UI)
    await page.getByRole('button', { name: /log out|sign out/i }).click();
    
    // Should redirect to home or login
    await expect(page).toHaveURL(/\/(auth\/login)?$/, { timeout: 5000 });
    
    // Try to access dashboard (should redirect to login)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
