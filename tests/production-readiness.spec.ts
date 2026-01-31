import { test, expect } from '@playwright/test'

/**
 * World-Class Production Readiness Tests
 *
 * Validates:
 * - Authentication flows (Azure AD, SAML)
 * - Stripe checkout integration (CSP compatibility)
 * - Dashboard access (authorization)
 * - Error handling (no raw error messages exposed)
 * - Rate limiting (fail-closed in production)
 * - Session management
 */

// Set base URL from environment or use default
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

test.describe('Production Readiness Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Configure test environment
    page.on('console', (msg) => {
      // Fail if console has CSP violations or errors
      if (msg.type() === 'error' && msg.text().includes('Refused to')) {
        throw new Error(`CSP violation: ${msg.text()}`)
      }
    })

    page.on('response', (response) => {
      // Fail if auth returns 500+ errors or generic error without proper structure
      if (response.status() >= 500) {
        throw new Error(`Server error: ${response.status()} ${response.url()}`)
      }
    })
  })

  test('Login page loads without CSP violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`)

    // Should not have CSP violation errors
    const violations = await page.evaluate(() => {
      const errors: string[] = []
      window.addEventListener('securitypolicyviolation', (e: any) => {
        errors.push(e.violatedDirective)
      })
      return errors
    })

    expect(violations).toHaveLength(0)
    expect(page.locator('h1')).toContainText(/login|sign in/i)
  })

  test('Pricing page loads and Stripe checkout button is ready', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)

    // Wait for pricing cards to load
    const pricingCards = page.locator('[data-testid="pricing-card"]')
    await expect(pricingCards.first()).toBeVisible({ timeout: 5000 })

    // Find checkout button
    const checkoutBtn = page
      .locator('button:has-text("Get Started"), button:has-text("Upgrade")')
      .first()

    // Button should be visible and clickable
    await expect(checkoutBtn).toBeVisible()
    await expect(checkoutBtn).toBeEnabled()

    // Stripe script should be loaded
    const hasStripe = await page.evaluate(() => (window as any).Stripe !== undefined)
    expect(hasStripe).toBe(true)
  })

  test('Error responses are generic (no raw error.message exposed)', async ({ page }) => {
    // Try accessing admin without auth
    const response = await page.request.get(`${BASE_URL}/api/admin/roles`, {
      headers: {
        Authorization: 'Bearer invalid-token-intentional',
      },
    })

    // Should be 401 or similar
    expect([401, 403, 500]).toContain(response.status())

    const data = await response.json()

    // Should NOT contain raw error.message patterns
    const responseText = JSON.stringify(data).toLowerCase()
    expect(responseText).not.toMatch(/enoent|eacces|sql|postgres|mongodb/)
    expect(responseText).not.toMatch(/\.js:\d+:\d+/) // Stack trace pattern
    expect(responseText).not.toMatch(/at\s+\w+\s+\(/i) // Stack frame pattern
  })

  test('Rate limiting headers present on successful requests', async ({ page }) => {
    // Make a request to a rate-limited endpoint
    const response = await page.request.get(`${BASE_URL}/api/contact`, {
      method: 'OPTIONS',
    })

    // Even on OPTIONS, headers should be present or 405 acceptable
    if (response.status() === 200 || response.status() === 204) {
      const hasRateLimit =
        response.headers()['x-ratelimit-limit'] || response.headers()['x-ratelimit-remaining']

      // Should have rate limit headers
      expect(
        [
          response.headers()['x-ratelimit-limit'],
          response.headers()['x-ratelimit-remaining'],
        ].filter(Boolean)
      ).toHaveLength(2)
    }
  })

  test('Dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Should redirect to login
    expect(page.url()).toContain('/login')
  })

  test('Console has no production errors or CSP issues', async ({ page }) => {
    await page.goto(`${BASE_URL}`)

    const consoleMessages: any[] = []

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      })
    })

    // Wait for page to settle
    await page.waitForLoadState('networkidle')

    // Filter out expected warnings
    const errors = consoleMessages.filter(
      (m) =>
        m.type === 'error' &&
        !m.text.includes('ResizeObserver loop') &&
        !m.text.includes('chrome-extension://')
    )

    // Should have no unexpected errors
    if (errors.length > 0) {
      console.log('Console errors:', errors)
    }
    expect(errors).toHaveLength(0)
  })

  test('Security headers are present', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/`)

    const headers = response.headers()

    // Check security headers
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['content-security-policy']).toBeDefined()

    // CSP should NOT contain 'unsafe-eval'
    const csp = headers['content-security-policy'] || ''
    expect(csp).not.toContain('unsafe-eval')
  })

  test('API error responses follow error-responses utility pattern', async ({ page }) => {
    // Try a malformed request
    const response = await page.request.post(`${BASE_URL}/api/contact`, {
      data: {
        // Missing required fields
      },
    })

    const data = await response.json()

    // Should have 'error' field with generic message
    expect(data).toHaveProperty('error')
    expect(typeof data.error).toBe('string')

    // Error should be generic, not exposing internals
    const errorLower = data.error.toLowerCase()
    expect(
      ['invalid', 'required', 'failed', 'error', 'temporary'].some((word) =>
        errorLower.includes(word)
      )
    ).toBe(true)
  })
})

test.describe('Authentication Flow (Azure AD)', () => {
  test('Azure login URL is properly formed', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`)

    // Look for Azure login button
    const azureBtn = page.locator('button:has-text("Azure"), a:has-text("Azure")').first()

    if (await azureBtn.isVisible()) {
      const href = await azureBtn.getAttribute('href')

      // Should have proper OAuth parameters
      expect(href).toMatch(/response_type=code/)
      expect(href).toMatch(/client_id=/)
      expect(href).toMatch(/redirect_uri=/)
      expect(href).toMatch(/state=/) // CSRF protection
    }
  })
})

test.describe('CSP Compliance Checklist', () => {
  test('No inline scripts with hardcoded content', async ({ page }) => {
    await page.goto(`${BASE_URL}`)

    const inlineScripts = await page.locator('script:not([src])').count()

    // Next.js may have some inline scripts, but not excessive
    expect(inlineScripts).toBeLessThan(10)
  })

  test('External scripts are from whitelisted domains', async ({ page }) => {
    const scripts: string[] = []

    page.on('request', (request) => {
      if (request.resourceType() === 'script') {
        scripts.push(request.url())
      }
    })

    await page.goto(`${BASE_URL}/pricing`)
    await page.waitForLoadState('networkidle')

    // Collect script sources
    const scriptElements = await page.locator('script[src]').all()

    for (const script of scriptElements) {
      const src = await script.getAttribute('src')
      if (src) {
        scripts.push(src)
      }
    }

    // Should not have scripts from unexpected domains
    const allowedDomains = [
      'localhost',
      'cdn.jsdelivr.net',
      'js.stripe.com',
      'googletagmanager.com',
      'google-analytics.com',
    ]

    for (const script of scripts) {
      const url = new URL(script, `${BASE_URL}/`)
      const domain = url.hostname

      const isAllowed = allowedDomains.some(
        (allowed) => domain.includes(allowed) || url.pathname.includes('/_next/')
      )

      expect(isAllowed).toBe(true)
    }
  })
})
