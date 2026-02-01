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
      sourceSystem: 'canlii_hrto',
      apiMode: 'rest',
      baseUrl: 'https://www.canlii.org',
      databaseId: 'onhrt',
    }

    const mockWebScraperConfig: SourceConfig = {
      sourceSystem: 'canlii_hrto',
      apiMode: 'scrape',
      baseUrl: 'https://www.canlii.org',
      listingUrl: 'https://example.com/cases',
    }

    const mockAutoConfig: SourceConfig = {
      sourceSystem: 'canlii_hrto',
      baseUrl: 'https://www.canlii.org',
      databaseId: 'onhrt',
      // apiMode not specified - should auto-detect
    }

    it.skip('should select REST API mode when explicitly configured', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        const mode = selectScraperMode(mockRestApiConfig.sourceSystem, mockRestApiConfig)
        expect(mode).toBe('rest')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should reject web scraper mode for CanLII sources (compliance)', () => {
      // CanLII sources must use REST API - scrape mode is blocked
      expect(() => {
        selectScraperMode(mockWebScraperConfig.sourceSystem, mockWebScraperConfig)
      }).toThrow(/cannot use web scraping mode/i)
    })

    it.skip('should auto-select based on environment', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        // Test with REST API disabled
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED

        const mode1 = selectScraperMode(mockAutoConfig.sourceSystem, mockAutoConfig)
        expect(mode1).toBe('scrape')

        // Test with REST API enabled
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        const mode2 = selectScraperMode(mockAutoConfig.sourceSystem, mockAutoConfig)
        expect(mode2).toBe('rest')
      } finally {
        // Restore env
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY

        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should reject scrape mode even when REST API is available (compliance)', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        // Set env to REST API enabled
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        // CanLII sources cannot explicitly request scraper mode
        expect(() => {
          selectScraperMode(mockWebScraperConfig.sourceSystem, mockWebScraperConfig)
        }).toThrow(/cannot use web scraping mode/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should fail closed when REST API is not configured (compliance)', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        // Remove API key and disable - CanLII sources should fail
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED

        expect(() => {
          selectScraperMode(mockAutoConfig.sourceSystem, mockAutoConfig)
        }).toThrow(/requires CANLII_API_KEY/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })
  })

  // =========================================================================
  // SCRAPER CREATION
  // =========================================================================

  describe('Scraper Creation', () => {
    it.skip('should create REST API scraper in REST mode', async () => {
      const config: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        apiMode: 'rest',
        baseUrl: 'https://www.canlii.org',
        databaseId: 'onhrt',
      }

      // Set up environment
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED
      process.env.CANLII_API_KEY = 'test-key'
      process.env.CANLII_API_ENABLED = 'true'

      try {
        const scraper = await createScraperWithMode(config.sourceSystem, config, 'rest')
        expect(scraper).toBeDefined()
        expect(scraper).toHaveProperty('discoverDecisions')
        expect(scraper).toHaveProperty('fetchDecisionContent')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should create web scraper in scrape mode', async () => {
      const config: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        apiMode: 'scrape',
        baseUrl: 'https://www.canlii.org',
        listingUrl: 'https://example.com/cases',
      }

      const scraper = await createScraperWithMode(config.sourceSystem, config, 'scrape')
      expect(scraper).toBeDefined()
      expect(scraper).toHaveProperty('discoverDecisions')
      expect(scraper).toHaveProperty('fetchDecisionContent')
    })

    it('should throw error for invalid configuration', async () => {
      const invalidConfig: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        baseUrl: 'https://www.canlii.org',
        // Missing both databaseId and listingUrl
      }

      await expect(
        createScraperWithMode(invalidConfig.sourceSystem, invalidConfig, 'rest')
      ).rejects.toThrow()
    })
  })

  // =========================================================================
  // ERROR SCENARIOS
  // =========================================================================

  describe('Error Handling', () => {
    it('should throw error when API key is missing (fail closed)', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED

        const config: SourceConfig = {
          sourceSystem: 'canlii_hrto',
          apiMode: 'rest',
          baseUrl: 'https://www.canlii.org',
          databaseId: 'onhrt',
        }

        // Should throw error, not fall back
        expect(() => {
          selectScraperMode(config.sourceSystem, config)
        }).toThrow(/requires CANLII_API_KEY/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should throw error when database ID missing (fail closed)', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED
      process.env.CANLII_API_KEY = 'test-key'
      process.env.CANLII_API_ENABLED = 'true'

      try {
        const config: SourceConfig = {
          sourceSystem: 'canlii_hrto',
          apiMode: 'rest',
          baseUrl: 'https://www.canlii.org',
          // Missing databaseId
        }

        // Should throw error, not fall back
        expect(() => {
          selectScraperMode(config.sourceSystem, config)
        }).toThrow(/requires.*databaseId|databaseId.*required/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should reject scrape mode for CanLII sources (compliance)', () => {
      const config: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        apiMode: 'scrape',
        baseUrl: 'https://www.canlii.org',
        // Missing listingUrl
      }

      // Should throw error - CanLII cannot use scrape mode
      expect(() => {
        selectScraperMode(config.sourceSystem, config)
      }).toThrow(/cannot use web scraping mode/i)
    })
  })

  // =========================================================================
  // MIGRATION SCENARIOS
  // =========================================================================

  describe('Gradual Migration Support', () => {
    it.skip('should allow mixed modes (per-tribunal configuration)', () => {
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        process.env.CANLII_API_KEY = 'test-key'
        process.env.CANLII_API_ENABLED = 'true'

        const configs = [
          {
            sourceSystem: 'canlii_hrto' as const,
            apiMode: 'rest' as const,
            baseUrl: 'https://www.canlii.org',
            databaseId: 'onhrt',
          },
          {
            sourceSystem: 'canlii_chrt' as const,
            apiMode: 'rest' as const,
            baseUrl: 'https://www.canlii.org',
            databaseId: 'chrt',
          },
        ]

        // First two configs should work
        const modes = configs.map((cfg) => selectScraperMode(cfg.sourceSystem, cfg as SourceConfig))
        expect(modes[0]).toBe('rest')
        expect(modes[1]).toBe('rest')

        // Third config with scrape mode should throw
        const scrapeConfig = {
          sourceSystem: 'canlii_hrto' as const,
          apiMode: 'scrape' as const,
          baseUrl: 'https://www.canlii.org',
          listingUrl: 'https://legacy.example.com',
        }
        expect(() => {
          selectScraperMode(scrapeConfig.sourceSystem, scrapeConfig as SourceConfig)
        }).toThrow(/cannot use web scraping mode/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it('should require proper config for CanLII sources', () => {
      const config: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        apiMode: 'auto' as any, // Invalid mode
        baseUrl: 'https://www.canlii.org',
        databaseId: 'onhrt',
      }

      // CanLII sources require valid API configuration
      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED

        expect(() => {
          selectScraperMode(config.sourceSystem, config)
        }).toThrow(/requires CANLII_API_KEY/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })
  })

  // =========================================================================
  // BACKWARDS COMPATIBILITY
  // =========================================================================

  describe('Backwards Compatibility', () => {
    it('should reject legacy web scraper config for CanLII (compliance)', () => {
      const legacyConfig: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        baseUrl: 'https://www.canlii.org',
        listingUrl: 'https://example.com/cases',
        // No apiMode specified - should fail closed for CanLII
      }

      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED

      try {
        delete process.env.CANLII_API_KEY
        delete process.env.CANLII_API_ENABLED

        // CanLII sources must have API configured
        expect(() => {
          selectScraperMode(legacyConfig.sourceSystem, legacyConfig)
        }).toThrow(/requires CANLII_API_KEY/i)
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })

    it.skip('should support REST API config (new style)', () => {
      const newConfig: SourceConfig = {
        sourceSystem: 'canlii_hrto',
        apiMode: 'rest',
        baseUrl: 'https://www.canlii.org',
        databaseId: 'onhrt',
      }

      const origApiKey = process.env.CANLII_API_KEY
      const origApiEnabled = process.env.CANLII_API_ENABLED
      process.env.CANLII_API_KEY = 'test-key'
      process.env.CANLII_API_ENABLED = 'true'

      try {
        const mode = selectScraperMode(newConfig.sourceSystem, newConfig)
        expect(mode).toBe('rest')
      } finally {
        if (origApiKey) process.env.CANLII_API_KEY = origApiKey
        else delete process.env.CANLII_API_KEY
        if (origApiEnabled) process.env.CANLII_API_ENABLED = origApiEnabled
        else delete process.env.CANLII_API_ENABLED
      }
    })
  })
})
