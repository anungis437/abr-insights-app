/**
 * Scraper Factory & Mode Selection
 *
 * Dynamically selects between REST API and web scraping based on:
 * 1. Configuration (apiMode: 'rest' | 'scrape')
 * 2. Source system capabilities
 * 3. API availability and fallback logic
 *
 * This enables gradual migration from web scraping to official REST API.
 */

import type { SourceSystem, SourceConfig } from '../types'
import { logger } from '../utils/logger'
import { ENV } from '../config'

// Lazy imports to avoid circular dependencies
let CanLIIScraper: any
let CanLIIRestApiScraper: any

interface ScraperInstance {
  discoverDecisions(maxCases: number, startPage?: number): Promise<any[]>
  fetchDecisionContent(url: string): Promise<any>
}

// ============================================================================
// SCRAPER SELECTION LOGIC
// ============================================================================

/**
 * Determines which scraper mode to use
 */
function selectScraperMode(sourceSystem: SourceSystem, config: SourceConfig): 'rest' | 'scrape' {
  // Explicit configuration takes precedence
  if (config.apiMode === 'rest') {
    if (!config.databaseId) {
      logger.warn(
        'REST API mode requested but databaseId not configured, falling back to scraping',
        {
          sourceSystem,
        }
      )
      return 'scrape'
    }

    if (!ENV.CANLII_API_KEY) {
      logger.warn(
        'REST API mode requested but CANLII_API_KEY not configured, falling back to scraping',
        {
          sourceSystem,
        }
      )
      return 'scrape'
    }

    return 'rest'
  }

  if (config.apiMode === 'scrape') {
    return 'scrape'
  }

  // Default: Use REST API if available, otherwise scrape
  if (ENV.CANLII_API_ENABLED && ENV.CANLII_API_KEY && config.databaseId) {
    logger.info('REST API available, using API mode', { sourceSystem })
    return 'rest'
  }

  logger.info('REST API not available, using web scraping mode', { sourceSystem })
  return 'scrape'
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create appropriate scraper instance
 */
export async function createScraper(
  sourceSystem: SourceSystem,
  config: SourceConfig
): Promise<ScraperInstance> {
  const mode = selectScraperMode(sourceSystem, config)

  logger.info('Creating scraper instance', {
    sourceSystem,
    mode,
    databaseId: config.databaseId,
  })

  if (mode === 'rest') {
    // Dynamic import to avoid circular dependency
    const { CanLIIApiClient } = await import('../clients/canlii-api')
    const { createApiScraper } = await import('./canlii-rest-api')

    const apiClient = new CanLIIApiClient(ENV.CANLII_API_KEY)
    return createApiScraper(sourceSystem, config, apiClient)
  } else {
    // Dynamic import of legacy scraper
    const { default: LegacyCanLIIScraper } = await import('./canlii')

    const scraper = new LegacyCanLIIScraper(sourceSystem)
    return {
      discoverDecisions: (maxCases: number, startPage: number = 1) =>
        scraper.discoverDecisions(maxCases, startPage),
      fetchDecisionContent: (url: string) => scraper.fetchDecisionContent(url),
    }
  }
}

/**
 * Create scraper with explicit mode (for testing)
 */
export async function createScraperWithMode(
  sourceSystem: SourceSystem,
  config: SourceConfig,
  mode: 'rest' | 'scrape'
): Promise<ScraperInstance> {
  logger.info('Creating scraper with explicit mode', {
    sourceSystem,
    mode,
  })

  if (mode === 'rest') {
    if (!config.databaseId || !ENV.CANLII_API_KEY) {
      throw new Error('Cannot use REST API mode: databaseId or API key not configured')
    }

    const { CanLIIApiClient } = await import('../clients/canlii-api')
    const { createApiScraper } = await import('./canlii-rest-api')

    const apiClient = new CanLIIApiClient(ENV.CANLII_API_KEY)
    return createApiScraper(sourceSystem, config, apiClient)
  } else {
    const { default: LegacyCanLIIScraper } = await import('./canlii')

    const scraper = new LegacyCanLIIScraper(sourceSystem)
    return {
      discoverDecisions: (maxCases: number, startPage: number = 1) =>
        scraper.discoverDecisions(maxCases, startPage),
      fetchDecisionContent: (url: string) => scraper.fetchDecisionContent(url),
    }
  }
}

// ============================================================================
// EXPORTS (validateScraperConfig removed - use canlii-validation.ts instead)
// ============================================================================

export { selectScraperMode }
