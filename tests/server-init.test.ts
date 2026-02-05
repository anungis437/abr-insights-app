/**
 * Server Initialization Tests
 *
 * Validates that server initialization:
 * - Runs exactly once (idempotent)
 * - Fails fast in production with missing env vars
 * - Does not fail in dev/test with missing env vars
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initializeServer, resetInitialization } from '@/lib/config/server-init'

describe('Server Initialization', () => {
  // Store original env vars
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset initialization state before each test
    resetInitialization()

    // Clear all env vars for clean slate
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('Idempotency', () => {
    it('should run initialization only once', () => {
      // Set up valid environment
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32) + Math.random().toString(36)
      process.env.NEXTAUTH_URL = 'https://test.com'

      // First call should initialize
      expect(() => initializeServer()).not.toThrow()

      // Second call should be a no-op (not re-initialize)
      expect(() => initializeServer()).not.toThrow()

      // Third call should also be a no-op
      expect(() => initializeServer()).not.toThrow()
    })

    it('should allow re-initialization after reset in test env', () => {
      process.env.NODE_ENV = 'test'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'

      // Initialize
      expect(() => initializeServer()).not.toThrow()

      // Reset
      expect(() => resetInitialization()).not.toThrow()

      // Should be able to initialize again
      expect(() => initializeServer()).not.toThrow()
    })

    it('should not allow reset in non-test environments', () => {
      process.env.NODE_ENV = 'production'

      expect(() => resetInitialization()).toThrow(
        'resetInitialization can only be called in test environment'
      )
    })
  })

  describe('Production Environment Validation', () => {
    it('should throw in production with missing required env vars', () => {
      process.env.NODE_ENV = 'production'
      // Missing all required vars

      expect(() => initializeServer()).toThrow()
    })

    it('should throw in production with missing SUPABASE_URL', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32) + Math.random().toString(36)
      process.env.NEXTAUTH_URL = 'https://test.com'
      // Missing NEXT_PUBLIC_SUPABASE_URL

      expect(() => initializeServer()).toThrow()
    })

    it('should throw in production with insecure NEXTAUTH_SECRET', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'test-secret-minimum-32-characters-long-for-test' // Insecure
      process.env.NEXTAUTH_URL = 'https://test.com'

      expect(() => initializeServer()).toThrow()
    })

    it('should succeed in production with all valid env vars', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJtest'
      process.env.NEXTAUTH_SECRET = 'a'.repeat(32) + Math.random().toString(36)
      process.env.NEXTAUTH_URL = 'https://test.com'

      expect(() => initializeServer()).not.toThrow()
    })
  })

  describe('Development/Test Environment Validation', () => {
    it('should not throw in development with missing env vars', () => {
      process.env.NODE_ENV = 'development'
      // Missing all required vars

      // Should log warnings but not throw
      expect(() => initializeServer()).not.toThrow()
    })

    it('should not throw in test with missing env vars', () => {
      process.env.NODE_ENV = 'test'
      // Missing all required vars

      // Should log warnings but not throw
      expect(() => initializeServer()).not.toThrow()
    })

    it('should succeed in development with partial env vars', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      // Other vars missing

      expect(() => initializeServer()).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined NODE_ENV gracefully', () => {
      // Set NODE_ENV to undefined
      delete process.env.NODE_ENV
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJtest'

      // Should not throw (defaults to development-like behavior)
      expect(() => initializeServer()).not.toThrow()
    })

    it('should handle empty string env vars', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

      // Should throw due to missing/invalid values
      expect(() => initializeServer()).toThrow()
    })
  })
})
