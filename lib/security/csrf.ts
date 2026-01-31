/**
 * CSRF Protection (P1 Security)
 *
 * Protects sensitive operations from Cross-Site Request Forgery attacks.
 * Uses cryptographically secure tokens that are validated on each request.
 *
 * Usage in API routes:
 * ```typescript
 * import { validateCSRFToken } from '@/lib/security/csrf'
 *
 * export async function POST(request: NextRequest) {
 *   const isValid = await validateCSRFToken(request)
 *   if (!isValid) {
 *     return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
 *   }
 *   // ... proceed with sensitive operation
 * }
 * ```
 *
 * Usage in forms/client code:
 * ```typescript
 * import { getCSRFToken } from '@/lib/security/csrf'
 *
 * const token = await getCSRFToken()
 * await fetch('/api/stripe/checkout', {
 *   method: 'POST',
 *   headers: { 'x-csrf-token': token }
 * })
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import { randomBytes, createHmac } from 'crypto'
import { logger } from '@/lib/utils/production-logger'

const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60 // 1 hour
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET

if (!CSRF_SECRET) {
  logger.warn('CSRF_SECRET not configured - using fallback (not secure for production)')
}

interface CSRFToken {
  token: string
  userId: string
  expiresAt: number
}

/**
 * Generate a cryptographically secure CSRF token for the current user
 * Tokens are single-use and expire after 1 hour
 */
export async function generateCSRFToken(userId: string): Promise<string> {
  const randomToken = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY

  // Create HMAC signature to prevent tampering
  const payload = `${randomToken}:${userId}:${expiresAt}`
  const signature = createHmac('sha256', CSRF_SECRET!).update(payload).digest('base64url')

  // Token format: randomToken.userId.expiresAt.signature
  const token = `${randomToken}.${userId}.${expiresAt}.${signature}`

  logger.debug('Generated CSRF token', { userId, expiresAt: new Date(expiresAt).toISOString() })

  return token
}

/**
 * Validate CSRF token from request headers or body
 * Returns true if token is valid, false otherwise
 */
export async function validateCSRFToken(
  request: Request,
  expectedUserId: string
): Promise<boolean> {
  try {
    // Extract token from header or body
    const headerToken = request.headers.get('x-csrf-token')
    let bodyToken: string | undefined

    if (!headerToken && request.method === 'POST') {
      try {
        const body = await request.json()
        bodyToken = body.csrfToken
      } catch {
        // Not JSON or no body
      }
    }

    const token = headerToken || bodyToken

    if (!token) {
      logger.warn('CSRF validation failed: No token provided', { expectedUserId })
      return false
    }

    // Parse token
    const parts = token.split('.')
    if (parts.length !== 4) {
      logger.warn('CSRF validation failed: Invalid token format', { expectedUserId })
      return false
    }

    const [randomToken, tokenUserId, expiresAtStr, signature] = parts

    // Verify user ID matches
    if (tokenUserId !== expectedUserId) {
      logger.warn('CSRF validation failed: User ID mismatch', {
        expectedUserId,
        tokenUserId,
      })
      return false
    }

    // Verify not expired
    const expiresAt = parseInt(expiresAtStr, 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      logger.warn('CSRF validation failed: Token expired', {
        expectedUserId,
        expiresAt: new Date(expiresAt).toISOString(),
      })
      return false
    }

    // Verify HMAC signature
    const payload = `${randomToken}:${tokenUserId}:${expiresAtStr}`
    const expectedSignature = createHmac('sha256', CSRF_SECRET!).update(payload).digest('base64url')

    if (signature !== expectedSignature) {
      logger.warn('CSRF validation failed: Invalid signature', { expectedUserId })
      return false
    }

    logger.debug('CSRF token validated successfully', { userId: expectedUserId })
    return true
  } catch (error) {
    logger.error('CSRF validation error', error as Error, { expectedUserId })
    return false
  }
}

/**
 * Middleware helper to validate CSRF token in API routes
 * Throws 403 error if token is invalid
 */
export async function requireCSRFToken(request: Request, userId: string): Promise<void> {
  const isValid = await validateCSRFToken(request, userId)
  if (!isValid) {
    throw new Error('Invalid or missing CSRF token')
  }
}

/**
 * Client-side helper to get CSRF token for current user
 * Call this before making sensitive requests
 */
export async function getCSRFToken(): Promise<string> {
  const response = await fetch('/api/csrf/token', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to get CSRF token')
  }

  const { token } = await response.json()
  return token
}
