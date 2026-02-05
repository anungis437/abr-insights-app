/**
 * Error Response Helper Tests
 */

import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import {
  ErrorCode,
  respondError,
  respondErrorFromException,
  respondUnauthorized,
  respondForbidden,
  respondNotFound,
  respondValidationError,
  respondRateLimitExceeded,
  respondInternalError,
} from '@/lib/api/respondError'

describe('Error Response Helpers', () => {
  describe('respondError', () => {
    it('should return standard error format', async () => {
      const response = respondError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid input',
      })

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('code', ErrorCode.VALIDATION_ERROR)
      expect(data.error).toHaveProperty('message', 'Invalid input')
      expect(data.error).toHaveProperty('correlationId')
    })

    it('should include correlation ID from request header', async () => {
      const correlationId = 'test-correlation-id'
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-correlation-id': correlationId,
        },
      })

      const response = respondError({
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
        request,
      })

      const data = await response.json()
      expect(data.error.correlationId).toBe(correlationId)
    })

    it('should generate correlation ID if not in request', async () => {
      const response = respondError({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Error',
      })

      const data = await response.json()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(data.error.correlationId).toMatch(uuidRegex)
    })

    it('should include details when provided', async () => {
      const details = { field: 'email', reason: 'invalid format' }

      const response = respondError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details,
      })

      const data = await response.json()
      expect(data.details).toEqual(details)
    })

    it('should use correct HTTP status for error codes', async () => {
      const testCases = [
        { code: ErrorCode.UNAUTHORIZED, expectedStatus: 401 },
        { code: ErrorCode.FORBIDDEN, expectedStatus: 403 },
        { code: ErrorCode.NOT_FOUND, expectedStatus: 404 },
        { code: ErrorCode.VALIDATION_ERROR, expectedStatus: 400 },
        { code: ErrorCode.RATE_LIMIT_EXCEEDED, expectedStatus: 429 },
        { code: ErrorCode.INTERNAL_ERROR, expectedStatus: 500 },
        { code: ErrorCode.SERVICE_UNAVAILABLE, expectedStatus: 503 },
      ]

      for (const { code, expectedStatus } of testCases) {
        const response = respondError({ code, message: 'Test' })
        expect(response.status).toBe(expectedStatus)
      }
    })

    it('should allow custom status code override', async () => {
      const response = respondError({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Custom error',
        statusCode: 418, // I'm a teapot
      })

      expect(response.status).toBe(418)
    })

    it('should set x-correlation-id response header', async () => {
      const response = respondError({
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
        correlationId: 'test-id',
      })

      expect(response.headers.get('x-correlation-id')).toBe('test-id')
    })

    it('should not expose internal error to client', async () => {
      const internalError = new Error('Database connection failed')

      const response = respondError({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database error occurred',
        internalError,
      })

      const data = await response.json()
      const dataString = JSON.stringify(data)

      // Internal error message should not be in response
      expect(dataString).not.toContain('Database connection failed')
    })
  })

  describe('respondErrorFromException', () => {
    it('should map Error to appropriate error code', async () => {
      const error = new Error('unauthorized access')

      const response = respondErrorFromException(error)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    })

    it('should detect rate limit errors', async () => {
      const error = new Error('rate limit exceeded')

      const response = respondErrorFromException(error)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
    })

    it('should detect not found errors', async () => {
      const error = new Error('resource not found')

      const response = respondErrorFromException(error)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.NOT_FOUND)
    })

    it('should default to internal error for unknown errors', async () => {
      const error = new Error('something weird happened')

      const response = respondErrorFromException(error)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    })

    it('should handle non-Error objects', async () => {
      const error = 'string error'

      const response = respondErrorFromException(error)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
    })

    it('should allow custom message override', async () => {
      const error = new Error('internal details')

      const response = respondErrorFromException(error, {
        message: 'Custom user message',
      })

      const data = await response.json()
      expect(data.error.message).toBe('Custom user message')
    })
  })

  describe('Quick helper functions', () => {
    it('respondUnauthorized should return 401', async () => {
      const response = respondUnauthorized()
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED)
    })

    it('respondForbidden should return 403', async () => {
      const response = respondForbidden()
      expect(response.status).toBe(403)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.FORBIDDEN)
    })

    it('respondNotFound should return 404', async () => {
      const response = respondNotFound()
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.NOT_FOUND)
    })

    it('respondValidationError should return 400 with details', async () => {
      const details = { field: 'email' }
      const response = respondValidationError('Invalid email', details)

      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(data.details).toEqual(details)
    })

    it('respondRateLimitExceeded should return 429 with Retry-After', async () => {
      const retryAfter = 60
      const response = respondRateLimitExceeded(retryAfter)

      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('60')

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
      expect(data.details?.retryAfter).toBe(60)
    })

    it('respondInternalError should return 500', async () => {
      const error = new Error('something broke')
      const response = respondInternalError(error)

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR)
      // Error message should be generic in production
      expect(data.error.message).toContain('internal error')
    })
  })

  describe('Correlation ID propagation', () => {
    it('should use request correlation ID across all helpers', async () => {
      const correlationId = 'test-123'
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-correlation-id': correlationId,
        },
      })

      const responses = [
        respondUnauthorized('', request),
        respondForbidden('', request),
        respondNotFound('', request),
        respondInternalError(undefined, request),
      ]

      for (const response of responses) {
        const data = await response.json()
        expect(data.error.correlationId).toBe(correlationId)
        expect(response.headers.get('x-correlation-id')).toBe(correlationId)
      }
    })
  })
})
