/**
 * CanLII REST API Integration Tests
 *
 * Comprehensive test suite for:
 * - API client functionality
 * - Database discovery
 * - Configuration validation
 * - Error handling and recovery
 * - Health checks and diagnostics
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { CanLIIApiClient } from '../src/clients/canlii-api'
import { CanLIIDatabaseMapper } from '../src/clients/canlii-database-mapper'
import {
  validateApiConfiguration,
  validateDatabaseId,
  validateCaseId,
  validateDecisionDate,
  isRetryableError,
  calculateBackoffDelay,
  CanLIIError,
  ERROR_CODES,
} from '../src/validation/canlii-validation'

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_API_KEY = process.env.CANLII_API_KEY || 'test-key'
const SKIP_LIVE_TESTS = !process.env.CANLII_API_KEY

describe('CanLII REST API Integration', () => {
  // =========================================================================
  // API CLIENT TESTS
  // =========================================================================

  describe('CanLIIApiClient', () => {
    let client: CanLIIApiClient

    beforeAll(() => {
      client = new CanLIIApiClient(TEST_API_KEY)
    })

    it('should initialize client with API key', () => {
      expect(client).toBeDefined()
    })

    it.skipIf(SKIP_LIVE_TESTS)('should validate API connection', async () => {
      const isValid = await client.validateConnection()
      expect(typeof isValid).toBe('boolean')
    })

    it.skipIf(SKIP_LIVE_TESTS)('should get list of databases', async () => {
      const databases = await client.getCaseDatabases()
      expect(Array.isArray(databases)).toBe(true)
      expect(databases.length).toBeGreaterThan(0)

      // Check database structure
      const db = databases[0]
      expect(db).toHaveProperty('databaseId')
      expect(db).toHaveProperty('jurisdiction')
      expect(db).toHaveProperty('name')
    })

    it.skipIf(SKIP_LIVE_TESTS)('should discover cases from database', async () => {
      // Use a known small database for testing
      const cases = await client.discoverCases('onhrt', 0, 10)
      expect(Array.isArray(cases)).toBe(true)

      if (cases.length > 0) {
        const caseRef = cases[0]
        expect(caseRef).toHaveProperty('databaseId')
        expect(caseRef).toHaveProperty('caseId')
        expect(caseRef).toHaveProperty('title')
        expect(caseRef).toHaveProperty('citation')
      }
    })

    it.skipIf(SKIP_LIVE_TESTS)('should handle pagination', async () => {
      // Get first page
      const page1 = await client.discoverCases('onhrt', 0, 5)
      expect(page1.length).toBeLessThanOrEqual(5)

      if (page1.length === 5) {
        // Get second page
        const page2 = await client.discoverCases('onhrt', 5, 5)
        expect(page2.length).toBeGreaterThan(0)

        // Pages should be different (assuming we have enough data)
        if (page2.length > 0) {
          expect(page1[0].caseId).not.toBe(page2[0].caseId)
        }
      }
    })

    it('should throw error for invalid database ID', async () => {
      expect(async () => {
        await client.discoverCases('invalid-db-id-that-does-not-exist', 0, 10)
      }).rejects.toThrow()
    })

    it('should throw error for invalid result count', async () => {
      expect(async () => {
        await client.discoverCases('onhrt', 0, 50001) // Max is 10,000
      }).rejects.toThrow()
    })
  })

  // =========================================================================
  // DATABASE MAPPER TESTS
  // =========================================================================

  describe('CanLIIDatabaseMapper', () => {
    let mapper: CanLIIDatabaseMapper
    let client: CanLIIApiClient

    beforeAll(() => {
      client = new CanLIIApiClient(TEST_API_KEY)
      mapper = new CanLIIDatabaseMapper(client)
    })

    it.skipIf(SKIP_LIVE_TESTS)('should discover and map databases', async () => {
      const mappings = await mapper.discoverAllDatabases()
      expect(Array.isArray(mappings)).toBe(true)
      expect(mappings.length).toBeGreaterThan(0)

      // Check mapping structure
      const mapping = mappings[0]
      expect(mapping).toHaveProperty('sourceId')
      expect(mapping).toHaveProperty('databaseId')
      expect(mapping).toHaveProperty('tribunalName')
      expect(mapping).toHaveProperty('matchQuality')
    })

    it.skipIf(SKIP_LIVE_TESTS)('should generate markdown output', async () => {
      const mappings = await mapper.discoverAllDatabases()
      const md = mapper.generateMarkdown()

      expect(typeof md).toBe('string')
      expect(md).toContain('# CanLII Database ID Mappings')
      expect(md).toContain('databaseId')
      if (mappings.length > 0) {
        expect(md).toContain(mappings[0].sourceId)
      }
    })

    it.skipIf(SKIP_LIVE_TESTS)('should export JSON mapping', async () => {
      const mappings = await mapper.discoverAllDatabases()
      const json = mapper.toJSON()

      expect(typeof json).toBe('object')
      expect(json).not.toBeNull()
      for (const mapping of mappings) {
        expect(json).toHaveProperty(mapping.sourceId)
      }
    })
  })

  // =========================================================================
  // VALIDATION TESTS
  // =========================================================================

  describe('Configuration Validation', () => {
    it('should validate API configuration', () => {
      const result = validateApiConfiguration()
      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should validate database IDs', () => {
      expect(validateDatabaseId('onhrt')).toBe(true)
      expect(validateDatabaseId('csc-scc')).toBe(true)
      expect(validateDatabaseId('onca')).toBe(true)

      // Invalid IDs
      expect(validateDatabaseId('')).toBe(false)
      expect(validateDatabaseId('a')).toBe(false) // Too short
      expect(validateDatabaseId('x'.repeat(30))).toBe(false) // Too long
      expect(validateDatabaseId('invalid ID')).toBe(false) // Spaces not allowed
    })

    it('should validate case IDs', () => {
      expect(validateCaseId('2008scc9')).toBe(true)
      expect(validateCaseId('1999canlii1527')).toBe(true)

      // Invalid IDs
      expect(validateCaseId('')).toBe(false)
      expect(validateCaseId('ab')).toBe(false) // Too short
      expect(validateCaseId('x'.repeat(100))).toBe(false) // Too long
      expect(validateCaseId('invalid case-id')).toBe(false) // Invalid chars
    })

    it('should validate decision dates', () => {
      expect(validateDecisionDate('2024-01-15')).toBe(true)
      expect(validateDecisionDate(new Date())).toBe(true)
      expect(validateDecisionDate(null)).toBe(true) // Optional
      expect(validateDecisionDate(undefined)).toBe(true) // Optional

      // Invalid dates
      expect(validateDecisionDate('invalid-date')).toBe(false)
      expect(validateDecisionDate(new Date('invalid'))).toBe(false)
      expect(validateDecisionDate('2024-13-45')).toBe(false) // Invalid month/day
    })
  })

  // =========================================================================
  // ERROR HANDLING TESTS
  // =========================================================================

  describe('Error Handling', () => {
    it('should create CanLII errors with proper structure', () => {
      const error = new CanLIIError(
        'Test error',
        ERROR_CODES.RATE_LIMITED,
        { retryAfter: 60 },
        true
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe(ERROR_CODES.RATE_LIMITED)
      expect(error.details).toEqual({ retryAfter: 60 })
      expect(error.retryable).toBe(true)
    })

    it('should identify retryable errors', () => {
      const retryableError = new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
      expect(isRetryableError(retryableError)).toBe(true)

      const nonRetryableError = new CanLIIError(
        'Invalid config',
        ERROR_CODES.INVALID_CONFIG,
        {},
        false
      )
      expect(isRetryableError(nonRetryableError)).toBe(false)

      // Test string-based error detection
      const timeoutError = new Error('Connection timeout')
      expect(isRetryableError(timeoutError)).toBe(true)

      const authError = new Error('Unauthorized')
      expect(isRetryableError(authError)).toBe(false)
    })

    it('should calculate exponential backoff', () => {
      const delay0 = calculateBackoffDelay(0, 1000, 30000)
      const delay1 = calculateBackoffDelay(1, 1000, 30000)
      const delay2 = calculateBackoffDelay(2, 1000, 30000)

      expect(delay0).toBeGreaterThanOrEqual(1000)
      expect(delay0).toBeLessThanOrEqual(1100) // 1000 + 10% jitter

      expect(delay1).toBeGreaterThanOrEqual(2000)
      expect(delay1).toBeLessThanOrEqual(2200)

      expect(delay2).toBeGreaterThanOrEqual(4000)
      expect(delay2).toBeLessThanOrEqual(4400)

      // Should not exceed max delay
      const maxedDelay = calculateBackoffDelay(10, 1000, 30000)
      expect(maxedDelay).toBeLessThanOrEqual(30000)
    })
  })

  // =========================================================================
  // ERROR CODES TESTS
  // =========================================================================

  describe('Error Codes', () => {
    it('should define all required error codes', () => {
      expect(ERROR_CODES.MISSING_API_KEY).toBeDefined()
      expect(ERROR_CODES.MISSING_DATABASE_ID).toBeDefined()
      expect(ERROR_CODES.AUTH_FAILED).toBeDefined()
      expect(ERROR_CODES.RATE_LIMITED).toBeDefined()
      expect(ERROR_CODES.SERVER_ERROR).toBeDefined()
      expect(ERROR_CODES.PAYLOAD_TOO_LARGE).toBeDefined()
      expect(ERROR_CODES.NOT_FOUND).toBeDefined()
      expect(ERROR_CODES.CONNECTION_TIMEOUT).toBeDefined()
      expect(ERROR_CODES.UNKNOWN_ERROR).toBeDefined()
    })

    it('should have unique error codes', () => {
      const codes = Object.values(ERROR_CODES)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })
  })

  // =========================================================================
  // INTEGRATION TESTS
  // =========================================================================

  describe('Integration Scenarios', () => {
    let client: CanLIIApiClient

    beforeAll(() => {
      client = new CanLIIApiClient(TEST_API_KEY)
    })

    it.skipIf(SKIP_LIVE_TESTS)('should handle complete discovery workflow', async () => {
      // 1. Validate configuration
      const configValidation = validateApiConfiguration()
      if (!configValidation.valid) {
        console.warn('Config validation warnings:', configValidation.warnings)
      }

      // 2. Get databases
      const databases = await client.getCaseDatabases()
      expect(databases.length).toBeGreaterThan(0)

      // 3. Filter to known human rights tribunals
      const hrDatabases = databases.filter((db) => db.name.toLowerCase().includes('human rights'))
      if (hrDatabases.length === 0) {
        console.warn('No human rights databases found in this test')
        return
      }

      // 4. Discover cases from first HR database
      const firstHr = hrDatabases[0]
      expect(validateDatabaseId(firstHr.databaseId)).toBe(true)

      const cases = await client.discoverCases(firstHr.databaseId, 0, 5)
      expect(Array.isArray(cases)).toBe(true)
    })

    it.skipIf(SKIP_LIVE_TESTS)('should handle empty result sets gracefully', async () => {
      // Request from a high offset that likely returns no results
      const cases = await client.discoverCases('onhrt', 1000000, 100)
      expect(Array.isArray(cases)).toBe(true)
      expect(cases.length).toBe(0)
    })
  })
})
