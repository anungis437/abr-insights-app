/**
 * Environment Validator Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  validateEnvironment,
  failFastEnvValidation,
  getEnvironmentInfo,
  getEnvironmentSummary,
} from '@/lib/utils/env-validator'

describe('Environment Validator', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateEnvironment', () => {
    it('should pass with all required variables set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
      process.env.NEXTAUTH_URL = 'http://localhost:3000'

      const result = validateEnvironment()

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
      expect(result.invalid).toHaveLength(0)
    })

    it('should detect missing required variables', () => {
      // Clear all required env vars to test missing detection
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      delete process.env.NEXTAUTH_SECRET
      delete process.env.NEXTAUTH_URL

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.missing.length).toBeGreaterThan(0)
      expect(result.missing).toContain('NEXTAUTH_SECRET')
      expect(result.missing).toContain('NEXTAUTH_URL')
    })

    it('should detect invalid URL format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-valid-url'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
      process.env.NEXTAUTH_URL = 'http://localhost:3000'

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.invalid.length).toBeGreaterThan(0)
      expect(result.invalid.some((i) => i.includes('invalid URL format'))).toBe(true)
    })

    it('should detect NEXTAUTH_SECRET that is too short', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'tooshort' // Less than 32 chars
      process.env.NEXTAUTH_URL = 'http://localhost:3000'

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.invalid.some((i) => i.includes('must be at least 32 characters'))).toBe(true)
    })

    it('should detect insecure NEXTAUTH_SECRET in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'test-secret-minimum-32-characters-long-for-test'
      process.env.NEXTAUTH_URL = 'https://production.com'

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.invalid.some((i) => i.includes('insecure/default value'))).toBe(true)
    })

    it('should require HTTPS in production for Supabase URL', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test.supabase.co' // HTTP not HTTPS
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'secure-random-secret-123456789012'
      process.env.NEXTAUTH_URL = 'https://production.com'

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.invalid.some((i) => i.includes('must use HTTPS'))).toBe(true)
    })

    it('should warn about missing optional variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
      // Not setting optional vars like RESEND_API_KEY

      const result = validateEnvironment()

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should validate service role key JWT format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'not-a-jwt' // Should start with eyJ
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
      process.env.NEXTAUTH_URL = 'http://localhost:3000'

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.invalid.some((i) => i.includes('invalid JWT format'))).toBe(true)
    })
  })

  describe('failFastEnvValidation', () => {
    it('should throw in production with invalid config', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      // Missing required vars

      expect(() => failFastEnvValidation()).toThrow()
    })

    it('should not throw in development with invalid config', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      // Missing required vars

      // Should not throw, just log warnings
      expect(() => failFastEnvValidation()).not.toThrow()
    })

    it('should not throw with valid configuration', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      // Use a properly random-looking secret (32+ chars, not default)
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32) + Math.random().toString(36).substring(2)
      process.env.NEXTAUTH_URL = 'https://production.com'

      expect(() => failFastEnvValidation()).not.toThrow()
    })
  })

  describe('getEnvironmentInfo', () => {
    it('should return environment information', () => {
      const info = getEnvironmentInfo()

      expect(info).toHaveProperty('node_version')
      expect(info).toHaveProperty('node_env')
      expect(info).toHaveProperty('platform')
      expect(info).toHaveProperty('arch')
      expect(info).toHaveProperty('uptime')
      expect(info).toHaveProperty('memory')
      expect(info.memory).toHaveProperty('total')
      expect(info.memory).toHaveProperty('used')
    })

    it('should include presence flags for sensitive variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXTAUTH_SECRET = 'secret'

      const info = getEnvironmentInfo()

      expect(info.has_supabase_url).toBe(true)
      expect(info.has_nextauth_secret).toBe(true)
    })

    it('should not expose actual sensitive values', () => {
      process.env.NEXTAUTH_SECRET = 'super-secret-value'

      const info = getEnvironmentInfo()
      const infoString = JSON.stringify(info)

      expect(infoString).not.toContain('super-secret-value')
    })
  })

  describe('getEnvironmentSummary', () => {
    it('should redact sensitive values', () => {
      process.env.NEXTAUTH_SECRET = 'super-secret-value-1234567890'

      const summary = getEnvironmentSummary()

      expect(summary.NEXTAUTH_SECRET).not.toBe('super-secret-value-1234567890')
      expect(summary.NEXTAUTH_SECRET).toMatch(/\*\*\*|\.\.\./)
    })

    it('should show first and last 4 chars for longer secrets', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJ1234567890abcdefgh'

      const summary = getEnvironmentSummary()

      expect(summary.SUPABASE_SERVICE_ROLE_KEY).toContain('eyJ1')
      expect(summary.SUPABASE_SERVICE_ROLE_KEY).toContain('efgh')
      expect(summary.SUPABASE_SERVICE_ROLE_KEY).toContain('...')
    })

    it('should indicate unset variables', () => {
      delete process.env.RESEND_API_KEY

      const summary = getEnvironmentSummary()

      expect(summary.RESEND_API_KEY).toBe('<not set>')
    })

    it('should not redact non-sensitive variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'

      const summary = getEnvironmentSummary()

      expect(summary.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
    })
  })
})
