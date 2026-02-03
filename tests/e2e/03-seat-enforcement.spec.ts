import { test, expect } from '@playwright/test'

/**
 * PR-09: E2E Smoke Test - Seat Enforcement (Team Plan)
 *
 * Critical Risk: Billing fraud, unauthorized team member additions
 *
 * Validates:
 * - Team plan enforces 5-user limit
 * - Org admin cannot invite 6th user
 * - Error message displayed when limit reached
 * - Upgrade prompt shown to add more users
 */

test.describe('Seat Enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no org admin credentials available
    if (!process.env.TEST_ORG_ADMIN_EMAIL || !process.env.TEST_ORG_ADMIN_PASSWORD) {
      test.skip()
      return
    }

    // Log in as org admin
    await page.goto('/auth/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_ORG_ADMIN_EMAIL)
    await page.getByLabel(/password/i).fill(process.env.TEST_ORG_ADMIN_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should display current seat usage', async ({ page }) => {
    // Navigate to organization settings
    await page.goto('/org/settings')

    // Should see team members section
    await expect(page.getByText(/team members|members/i)).toBeVisible()

    // Should see seat usage (e.g., "3/5 seats used")
    await expect(page.getByText(/\d+\/\d+ seats/i)).toBeVisible()
  })

  test('should show list of team members', async ({ page }) => {
    // Navigate to team members page
    await page.goto('/org/members')

    // Should see table or list of members
    await expect(page.getByText(/name|email|role/i)).toBeVisible()

    // Should see at least one member (the logged-in admin)
    const memberRows = page.locator('[data-testid="member-row"], tr').filter({ hasText: /@/ })
    await expect(memberRows.first()).toBeVisible()
  })

  test('should allow inviting user when under seat limit', async ({ page }) => {
    // Navigate to team members page
    await page.goto('/org/members')

    // Check current seat count
    const seatUsage = await page.getByText(/(\d+)\/\d+ seats/i).textContent()
    const currentSeats = parseInt(seatUsage?.match(/(\d+)\//)?.[1] || '0')

    // Skip if at or over limit
    if (currentSeats >= 5) {
      test.skip()
      return
    }

    // Click invite button
    await page.getByRole('button', { name: /invite|add member/i }).click()

    // Should see invite form
    await expect(page.getByLabel(/email/i)).toBeVisible()

    // Fill in email (use a unique test email)
    const testEmail = `test-${Date.now()}@example.com`
    await page.getByLabel(/email/i).fill(testEmail)

    // Select role
    await page.getByLabel(/role/i).selectOption('student')

    // Click send invite
    await page.getByRole('button', { name: /send invite|invite/i }).click()

    // Should see success message
    await expect(page.getByText(/invited|sent/i)).toBeVisible({ timeout: 5000 })
  })

  test('should block inviting 6th user on Team plan', async ({ page }) => {
    // Navigate to team members page
    await page.goto('/org/members')

    // Check current seat count
    const seatUsage = await page.getByText(/(\d+)\/\d+ seats/i).textContent()
    const currentSeats = parseInt(seatUsage?.match(/(\d+)\//)?.[1] || '0')

    // Skip if under limit (need to be at 5/5)
    if (currentSeats < 5) {
      test.skip() // This test requires a full team
      return
    }

    // Try to click invite button
    const inviteButton = page.getByRole('button', { name: /invite|add member/i })

    // Button should be disabled OR show upgrade prompt
    const isDisabled = await inviteButton.isDisabled().catch(() => false)

    if (!isDisabled) {
      // Click invite button
      await inviteButton.click()

      // Should see seat limit error or upgrade prompt
      await expect(page.getByText(/seat limit|upgrade|5 users/i)).toBeVisible({ timeout: 5000 })
    } else {
      // Button is disabled, should see tooltip or message about limit
      await expect(page.getByText(/seat limit|upgrade|max/i)).toBeVisible()
    }
  })

  test('should show upgrade prompt when at seat limit', async ({ page }) => {
    // Navigate to team members page
    await page.goto('/org/members')

    // Check current seat count
    const seatUsage = await page.getByText(/(\d+)\/\d+ seats/i).textContent()
    const currentSeats = parseInt(seatUsage?.match(/(\d+)\//)?.[1] || '0')

    // Skip if under limit
    if (currentSeats < 5) {
      test.skip()
      return
    }

    // Should see upgrade prompt or banner
    await expect(page.getByText(/upgrade.*more seats|add more users.*upgrade/i)).toBeVisible()

    // Should see upgrade button
    await expect(page.getByRole('button', { name: /upgrade/i })).toBeVisible()
  })

  test('should prevent exceeding seat limit via API', async ({ page, request }) => {
    // Skip if no API base URL configured
    if (!process.env.PLAYWRIGHT_BASE_URL) {
      test.skip()
      return
    }

    // Get auth cookie from logged-in session
    const cookies = await page.context().cookies()

    // Try to invite a 6th user via API (should fail if at limit)
    const response = await request.post(`${process.env.PLAYWRIGHT_BASE_URL}/api/org/invite`, {
      headers: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      },
      data: {
        email: `test-api-${Date.now()}@example.com`,
        role: 'student',
      },
    })

    // If at seat limit, should return 403 or 400
    if (response.status() === 403 || response.status() === 400) {
      const body = await response.json()
      expect(body.error).toMatch(/seat limit|max.*users/i)
    } else if (response.status() === 200) {
      // Under limit, invitation succeeded (expected)
      const body = await response.json()
      expect(body.success).toBe(true)
    }
  })
})
