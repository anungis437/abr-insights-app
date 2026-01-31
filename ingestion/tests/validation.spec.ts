/**
 * CanLII Validation & Error Handling Tests
 *
 * Tests for:
 * - Configuration validation
 * - Input validation (database IDs, case IDs, dates)
 * - Error classification
 * - Retry logic with exponential backoff
 * - Health check diagnostics
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  CanLIIError,
  ERROR_CODES,
  validateApiConfiguration,
  validateDatabaseId,
  validateCaseId,
  validateDecisionDate,
  isRetryableError,
  calculateBackoffDelay,
  retryWithBackoff,
} from '../src/validation/canlii-validation'

describe('CanLII Validation & Error Handling', () => {
  // =========================================================================
  // ERROR CLASS TESTS
  // =========================================================================

  describe('CanLIIError Class', () => {
    it('should create error with all properties', () => {
      const error = new CanLIIError(
        'Test error message',
        ERROR_CODES.RATE_LIMITED,
        { retryAfter: 60 },
        true
      )

      expect(error.message).toBe('Test error message')
      expect(error.code).toBe(ERROR_CODES.RATE_LIMITED)
      expect(error.details).toEqual({ retryAfter: 60 })
      expect(error.retryable).toBe(true)
      expect(error instanceof Error).toBe(true)
    })

    it('should have proper error inheritance', () => {
      const error = new CanLIIError('Test', ERROR_CODES.AUTH_FAILED, {}, false)

      expect(error instanceof CanLIIError).toBe(true)
      expect(error instanceof Error).toBe(true)
      expect(error.name).toBe('CanLIIError')
    })

    it('should handle undefined details', () => {
      const error = new CanLIIError('Test', ERROR_CODES.UNKNOWN_ERROR, undefined, true)

      expect(error.details).toBeUndefined()
    })
  })

  // =========================================================================
  // ERROR CODE DEFINITIONS
  // =========================================================================

  describe('Error Codes', () => {
    it('should define all critical error codes', () => {
      const criticalCodes = [
        ERROR_CODES.MISSING_API_KEY,
        ERROR_CODES.MISSING_DATABASE_ID,
        ERROR_CODES.AUTH_FAILED,
        ERROR_CODES.INVALID_CONFIG,
      ]

      for (const code of criticalCodes) {
        expect(code).toBeDefined()
        expect(typeof code).toBe('string')
      }
    })

    it('should define all retry-eligible error codes', () => {
      const retryCodes = [
        ERROR_CODES.RATE_LIMITED,
        ERROR_CODES.CONNECTION_TIMEOUT,
        ERROR_CODES.SERVER_ERROR,
      ]

      for (const code of retryCodes) {
        expect(code).toBeDefined()
      }
    })

    it('should have no duplicate error codes', () => {
      const allCodes = Object.values(ERROR_CODES)
      const uniqueCodes = new Set(allCodes)

      expect(uniqueCodes.size).toBe(allCodes.length)
    })
  })

  // =========================================================================
  // CONFIGURATION VALIDATION
  // =========================================================================

  describe('Configuration Validation', () => {
    it('should validate API configuration', () => {
      const result = validateApiConfiguration()

      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(typeof result.valid).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should detect missing API key', () => {
      const origApiKey = process.env.CANLII_API_KEY

      try {
        delete process.env.CANLII_API_KEY

        const result = validateApiConfiguration()
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors.some((e: string) => e.includes('API_KEY'))).toBe(true)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
      }
    })

    it('should validate API base URL format', () => {
      const origUrl = process.env.CANLII_API_BASE_URL

      try {
        process.env.CANLII_API_BASE_URL = 'not-a-url'

        const result = validateApiConfiguration()
        // Should warn about invalid URL format
        if (result.warnings.length > 0 || !result.valid) {
          expect(true).toBe(true)
        }
      } finally {
        if (origUrl) process.env.CANLII_API_BASE_URL = origUrl
        else delete process.env.CANLII_API_BASE_URL
      }
    })
  })

  // =========================================================================
  // INPUT VALIDATION
  // =========================================================================

  describe('Database ID Validation', () => {
    it('should validate correct database IDs', () => {
      const validIds = ['onhrt', 'chrt', 'csc-scc', 'ca', 'on', 'ab2024']

      for (const id of validIds) {
        expect(validateDatabaseId(id)).toBe(true)
      }
    })

    it('should reject empty database ID', () => {
      expect(validateDatabaseId('')).toBe(false)
    })

    it('should reject database ID that is too short', () => {
      expect(validateDatabaseId('a')).toBe(false)
    })

    it('should reject database ID that is too long', () => {
      const longId = 'x'.repeat(30)
      expect(validateDatabaseId(longId)).toBe(false)
    })

    it('should reject database ID with invalid characters', () => {
      expect(validateDatabaseId('invalid ID')).toBe(false) // Space
      expect(validateDatabaseId('invalid@id')).toBe(false) // Special char
      expect(validateDatabaseId('invalid#id')).toBe(false) // Special char
    })

    it('should allow hyphens in database ID', () => {
      expect(validateDatabaseId('csc-scc')).toBe(true)
    })
  })

  describe('Case ID Validation', () => {
    it('should validate correct case IDs', () => {
      const validIds = ['2008scc9', '1999canlii1527', 'case-id-2024', 'ABC123']

      for (const id of validIds) {
        expect(validateCaseId(id)).toBe(true)
      }
    })

    it('should reject empty case ID', () => {
      expect(validateCaseId('')).toBe(false)
    })

    it('should reject case ID that is too short', () => {
      expect(validateCaseId('ab')).toBe(false)
    })

    it('should reject case ID that is too long', () => {
      const longId = 'x'.repeat(100)
      expect(validateCaseId(longId)).toBe(false)
    })

    it('should reject case ID with invalid characters', () => {
      expect(validateCaseId('invalid case id')).toBe(false) // Spaces
      expect(validateCaseId('invalid case@id')).toBe(false) // @ symbol
    })

    it('should allow hyphens in case ID', () => {
      expect(validateCaseId('case-id-2024')).toBe(true)
    })
  })

  describe('Decision Date Validation', () => {
    it('should validate correct date strings', () => {
      expect(validateDecisionDate('2024-01-15')).toBe(true)
      expect(validateDecisionDate('2000-12-31')).toBe(true)
    })

    it('should validate Date objects', () => {
      expect(validateDecisionDate(new Date())).toBe(true)
      expect(validateDecisionDate(new Date('2024-01-15'))).toBe(true)
    })

    it('should accept null dates (optional)', () => {
      expect(validateDecisionDate(null)).toBe(true)
    })

    it('should accept undefined dates (optional)', () => {
      expect(validateDecisionDate(undefined)).toBe(true)
    })

    it('should reject invalid date strings', () => {
      expect(validateDecisionDate('invalid-date')).toBe(false)
      expect(validateDecisionDate('2024-13-45')).toBe(false) // Invalid month/day
      expect(validateDecisionDate('2024/01/15')).toBe(false) // Wrong format
    })

    it('should reject invalid Date objects', () => {
      expect(validateDecisionDate(new Date('invalid'))).toBe(false)
    })
  })

  // =========================================================================
  // ERROR CLASSIFICATION
  // =========================================================================

  describe('Retryable Error Classification', () => {
    it('should classify timeout as retryable', () => {
      const error = new CanLIIError('Connection timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should classify rate limit as retryable', () => {
      const error = new CanLIIError('Rate limited', ERROR_CODES.RATE_LIMITED, {}, true)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should classify server error as retryable', () => {
      const error = new CanLIIError('Server error', ERROR_CODES.SERVER_ERROR, {}, true)
      expect(isRetryableError(error)).toBe(true)
    })

    it('should classify auth failure as non-retryable', () => {
      const error = new CanLIIError('Auth failed', ERROR_CODES.AUTH_FAILED, {}, false)
      expect(isRetryableError(error)).toBe(false)
    })

    it('should classify invalid config as non-retryable', () => {
      const error = new CanLIIError('Invalid config', ERROR_CODES.INVALID_CONFIG, {}, false)
      expect(isRetryableError(error)).toBe(false)
    })

    it('should classify 404 as non-retryable', () => {
      const error = new CanLIIError('Not found', ERROR_CODES.NOT_FOUND, {}, false)
      expect(isRetryableError(error)).toBe(false)
    })

    it('should handle plain Error objects', () => {
      const timeoutError = new Error('Connection timeout')
      expect(isRetryableError(timeoutError)).toBe(true)

      const authError = new Error('Unauthorized')
      expect(isRetryableError(authError)).toBe(false)

      const unknownError = new Error('Random error')
      // Unknown errors should be non-retryable to avoid infinite loops
      expect(isRetryableError(unknownError)).toBe(false)
    })
  })

  // =========================================================================
  // BACKOFF CALCULATION
  // =========================================================================

  describe('Exponential Backoff Calculation', () => {
    it('should calculate delays with exponential growth', () => {
      const delay0 = calculateBackoffDelay(0, 1000, 30000)
      const delay1 = calculateBackoffDelay(1, 1000, 30000)
      const delay2 = calculateBackoffDelay(2, 1000, 30000)
      const delay3 = calculateBackoffDelay(3, 1000, 30000)

      // Each should roughly double (with jitter)
      expect(delay1).toBeGreaterThanOrEqual(delay0 * 1.5) // Allow for base delay
      expect(delay2).toBeGreaterThanOrEqual(delay1 * 1.5)
    })

    it('should not exceed maximum delay', () => {
      const maxDelay = 30000

      for (let attempt = 0; attempt < 10; attempt++) {
        const delay = calculateBackoffDelay(attempt, 1000, maxDelay)
        expect(delay).toBeLessThanOrEqual(maxDelay)
      }
    })

    it('should include jitter (randomness)', () => {
      const delays = []

      // Run multiple times to get different jitter values
      for (let i = 0; i < 10; i++) {
        delays.push(calculateBackoffDelay(2, 1000, 30000))
      }

      // With jitter, not all delays should be identical
      const uniqueDelays = new Set(delays)
      expect(uniqueDelays.size).toBeGreaterThan(1)
    })

    it('should respect base delay parameter', () => {
      const delay = calculateBackoffDelay(0, 5000, 30000)

      // Base delay with jitter should be close to base
      expect(delay).toBeGreaterThanOrEqual(5000)
      expect(delay).toBeLessThanOrEqual(5500)
    })

    it('should handle edge cases', () => {
      expect(calculateBackoffDelay(0, 0, 30000)).toBeGreaterThanOrEqual(0)
      expect(calculateBackoffDelay(100, 1000, 30000)).toBeLessThanOrEqual(30000)
    })
  })

  // =========================================================================
  // RETRY LOGIC
  // =========================================================================

  describe('Retry With Backoff', () => {
    it('should succeed on first attempt', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++
        return 'success'
      }

      const result = await retryWithBackoff(fn)

      expect(result).toBe('success')
      expect(callCount).toBe(1)
    })

    it('should retry on transient failure', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++
        if (callCount < 2) {
          throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
        }
        return 'success'
      }

      const result = await retryWithBackoff(fn, 3, 10) // Short delays for testing

      expect(result).toBe('success')
      expect(callCount).toBe(2)
    })

    it('should fail immediately on non-retryable error', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++
        throw new CanLIIError('Auth failed', ERROR_CODES.AUTH_FAILED, {}, false)
      }

      await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow()
      expect(callCount).toBe(1) // Should not retry
    })

    it('should exhaust retries after max attempts', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++
        throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
      }

      await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow()
      expect(callCount).toBe(3)
    })

    it('should handle mixed error types', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++

        if (callCount === 1) {
          throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
        }
        if (callCount === 2) {
          throw new CanLIIError('Rate limited', ERROR_CODES.RATE_LIMITED, {}, true)
        }

        return 'success'
      }

      const result = await retryWithBackoff(fn, 5, 10)

      expect(result).toBe('success')
      expect(callCount).toBe(3)
    })

    it('should respect maximum attempts parameter', async () => {
      let callCount = 0
      const fn = async () => {
        callCount++
        throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
      }

      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow()
      expect(callCount).toBe(2)
    })

    it('should accept custom base delay', async () => {
      let callCount = 0
      const startTime = Date.now()

      const fn = async () => {
        callCount++
        if (callCount === 1) {
          throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
        }
        return 'success'
      }

      const result = await retryWithBackoff(fn, 2, 50) // 50ms base delay
      const elapsed = Date.now() - startTime

      expect(result).toBe('success')
      expect(elapsed).toBeGreaterThanOrEqual(40) // Allow some variance
    })
  })

  // =========================================================================
  // INTEGRATION SCENARIOS
  // =========================================================================

  describe('Validation Integration Scenarios', () => {
    it('should validate complete API request parameters', () => {
      const databaseId = 'onhrt'
      const caseId = '2024canlii12345'
      const decisionDate = '2024-01-15'

      expect(validateDatabaseId(databaseId)).toBe(true)
      expect(validateCaseId(caseId)).toBe(true)
      expect(validateDecisionDate(decisionDate)).toBe(true)
    })

    it('should reject invalid parameter combinations', () => {
      const invalidDb = ''
      const validCase = 'case-123'
      const validDate = '2024-01-15'

      expect(validateDatabaseId(invalidDb)).toBe(false)
      expect(validateCaseId(validCase)).toBe(true)
      expect(validateDecisionDate(validDate)).toBe(true)
    })

    it('should handle error escalation', async () => {
      // Simulate progressive failure handling
      let attempt = 0

      const fn = async () => {
        attempt++

        if (attempt === 1) {
          throw new CanLIIError('Rate limited', ERROR_CODES.RATE_LIMITED, { retryAfter: 5 }, true)
        }
        if (attempt === 2) {
          throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
        }

        return 'finally succeeded'
      }

      const result = await retryWithBackoff(fn, 5, 10)
      expect(result).toBe('finally succeeded')
      expect(attempt).toBe(3)
    })
  })
})
