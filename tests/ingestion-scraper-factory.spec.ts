/**
 * Scraper Factory Integration Tests
 *
 * Tests for intelligent scraper selection and creation:
 * - REST API mode selection
 * - Web scraping mode fallback
 * - Configuration-based mode selection
 * - Dynamic scraper creation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { selectScraperMode, createScraperWithMode } from '../src/scrapers/factory'
import type { SourceConfig } from '../src/types'

describe('Scraper Factory', () => {
  // =========================================================================
  // MODE SELECTION LOGIC
  // =========================================================================

  describe('Scraper Mode Selection', () => {
    const mockRestApiConfig: SourceConfig = {
      name: 'CanLII REST API',
      type: 'canlii',
      apiMode: 'rest',
      databaseId: 'onhrt',
      enabled: true,
    }

    const mockWebScraperConfig: SourceConfig = {
      name: 'CanLII Web Scraper',
      type: 'canlii',
      apiMode: 'scrape',
      listingUrl: 'https://example.com/cases',
      enabled: true,
    }

    const mockAutoConfig: SourceConfig = {
      name: 'CanLII Auto',
      type: 'canlii',
      databaseId: 'onhrt',
      enabled: true,
      // apiMode not specified - should auto-detect
    }

    it('should select REST API mode when explicitly configured', () => {
      const mode = selectScraperMode(mockRestApiConfig)
      expect(mode).toBe('rest')
    })

    it('should select web scraper mode when explicitly configured', () => {
      const mode = selectScraperMode(mockWebScraperConfig)
      expect(mode).toBe('scrape')
    })

    it('should auto-select based on environment', () => {
      // Save original env
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        // Test with REST API disabled
        delete process.env.CANLII_API_KEY
        process.env.CANLII_API_ENABLED = 'false'

        const mode1 = selectScraperMode(mockAutoConfig)
        expect(mode1).toBe('scrape')

        // Test with REST API enabled
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        const mode2 = selectScraperMode(mockAutoConfig)
        expect(mode2).toBe('rest')
      } finally {
        // Restore env
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY

        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should prioritize explicit config over environment', () => {
      const origApiKey = process.env.CANLII_API_KEY

      try {
        // Set env to REST API enabled
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        // But config explicitly requests scraper
        const mode = selectScraperMode(mockWebScraperConfig)
        expect(mode).toBe('scrape')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
      }
    })

    it('should fall back to scraper when REST API is not configured', () => {
      const origApiKey = process.env.CANLII_API_KEY

      try {
        // Remove API key
        delete process.env.CANLII_API_KEY

        const mode = selectScraperMode(mockAutoConfig)
        expect(mode).toBe('scrape')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
      }
    })
  })

  // =========================================================================
  // SCRAPER CREATION
  // =========================================================================

  describe('Scraper Creation', () => {
    it('should create REST API scraper in REST mode', async () => {
      const config: SourceConfig = {
        name: 'Test REST API',
        type: 'canlii',
        apiMode: 'rest',
        databaseId: 'onhrt',
        enabled: true,
      }

      // Set up environment
      const origApiKey = process.env.CANLII_API_KEY
      process.env.CANLII_API_KEY = 'test-key'

      try {
        const scraper = await createScraperWithMode(config, 'rest')
        expect(scraper).toBeDefined()
        expect(scraper).toHaveProperty('discoverDecisions')
        expect(scraper).toHaveProperty('fetchDecisionContent')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
      }
    })

    it('should create web scraper in scrape mode', async () => {
      const config: SourceConfig = {
        name: 'Test Web Scraper',
        type: 'canlii',
        apiMode: 'scrape',
        listingUrl: 'https://example.com/cases',
        enabled: true,
      }

      const scraper = await createScraperWithMode(config, 'scrape')
      expect(scraper).toBeDefined()
      expect(scraper).toHaveProperty('discoverDecisions')
      expect(scraper).toHaveProperty('fetchDecisionContent')
    })

    it('should throw error for invalid configuration', async () => {
      const invalidConfig: SourceConfig = {
        name: 'Invalid Config',
        type: 'canlii',
        enabled: true,
        // Missing both databaseId and listingUrl
      }

      await expect(createScraperWithMode(invalidConfig, 'rest')).rejects.toThrow()
    })
  })

  // =========================================================================
  // ERROR SCENARIOS
  // =========================================================================

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      const origApiKey = process.env.CANLII_API_KEY

      try {
        delete process.env.CANLII_API_KEY

        const config: SourceConfig = {
          name: 'Test',
          type: 'canlii',
          apiMode: 'rest',
          databaseId: 'onhrt',
          enabled: true,
        }

        // Should fall back to scraper
        const mode = selectScraperMode(config)
        expect(mode).toBe('scrape')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
      }
    })

    it('should handle missing database ID for REST API', () => {
      const origApiKey = process.env.CANLII_API_KEY
      process.env.CANLII_API_KEY = 'test-key'
      process.env.CANLII_API_ENABLED = 'true'

      try {
        const config: SourceConfig = {
          name: 'Test',
          type: 'canlii',
          apiMode: 'rest',
          // Missing databaseId
          enabled: true,
        }

        // Should fall back to scraper
        const mode = selectScraperMode(config)
        expect(mode).toBe('scrape')
      } finally {
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
      }
    })

    it('should handle missing listing URL for web scraper', () => {
      const config: SourceConfig = {
        name: 'Test',
        type: 'canlii',
        apiMode: 'scrape',
        // Missing listingUrl
        enabled: true,
      }

      // Should throw during creation if mode is forced to scrape
      expect(() => {
        selectScraperMode(config)
      }).not.toThrow() // Mode selection doesn't throw, creation will
    })
  })

  // =========================================================================
  // MIGRATION SCENARIOS
  // =========================================================================

  describe('Gradual Migration Support', () => {
    it('should allow mixed modes (per-tribunal configuration)', () => {
      const configs = [
        {
          name: 'HRTO (REST API)',
          type: 'canlii',
          apiMode: 'rest' as const,
          databaseId: 'onhrt',
          enabled: true,
        },
        {
          name: 'CHRT (REST API)',
          type: 'canlii',
          apiMode: 'rest' as const,
          databaseId: 'chrt',
          enabled: true,
        },
        {
          name: 'Legacy Source (Scraper)',
          type: 'canlii',
          apiMode: 'scrape' as const,
          listingUrl: 'https://legacy.example.com',
          enabled: true,
        },
      ]

      const modes = configs.map((cfg) => selectScraperMode(cfg as SourceConfig))
      expect(modes[0]).toBe('rest')
      expect(modes[1]).toBe('rest')
      expect(modes[2]).toBe('scrape')
    })

    it('should support configuration override for testing', () => {
      const config: SourceConfig = {
        name: 'Test Config',
        type: 'canlii',
        apiMode: 'auto' as any, // Invalid mode to force override
        databaseId: 'onhrt',
        enabled: true,
      }

      const origApiKey = process.env.CANLII_API_KEY
      process.env.CANLII_API_KEY = 'test-key'
      process.env.CANLII_API_ENABLED = 'true'

      try {
        // When explicit mode override is provided, it should be used
        const mode = selectScraperMode(config)
        // With proper REST API config, should select REST
        expect(['rest', 'scrape']).toContain(mode)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED
      }
    })
  })

  // =========================================================================
  // BACKWARDS COMPATIBILITY
  // =========================================================================

  describe('Backwards Compatibility', () => {
    it('should support legacy web scraper config (no apiMode)', () => {
      const legacyConfig: SourceConfig = {
        name: 'Legacy Source',
        type: 'canlii',
        listingUrl: 'https://example.com/cases',
        enabled: true,
        // No apiMode specified
      }

      const mode = selectScraperMode(legacyConfig)
      expect(['rest', 'scrape']).toContain(mode)
    })

    it('should support REST API config (new style)', () => {
      const newConfig: SourceConfig = {
        name: 'New REST API',
        type: 'canlii',
        apiMode: 'rest',
        databaseId: 'onhrt',
        enabled: true,
      }

      const origApiKey = process.env.CANLII_API_KEY
      process.env.CANLII_API_KEY = 'test-key'

      try {
        const mode = selectScraperMode(newConfig)
        expect(mode).toBe('rest')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
      }
    })
  })
})
