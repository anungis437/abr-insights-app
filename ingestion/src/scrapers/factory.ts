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
 * 
 * CANLII COMPLIANCE: CanLII sources MUST use REST API or fail closed.
 * Web scraping fallback is disabled to ensure compliance with CanLII Terms of Use.
 */
function selectScraperMode(sourceSystem: SourceSystem, config: SourceConfig): 'rest' | 'scrape' {
  const isCanLIISource = sourceSystem.startsWith('canlii_')

  // Explicit configuration takes precedence
  if (config.apiMode === 'rest') {
    if (!config.databaseId) {
      if (isCanLIISource) {
        throw new Error(
          `CanLII source "${sourceSystem}" requires REST API with databaseId. Web scraping is not permitted for CanLII sources.`
        )
      }
      logger.warn(
        'REST API mode requested but databaseId not configured, falling back to scraping',
        { sourceSystem }
      )
      return 'scrape'
    }

    if (!ENV.CANLII_API_KEY) {
      if (isCanLIISource) {
        throw new Error(
          `CanLII source "${sourceSystem}" requires CANLII_API_KEY. Web scraping is not permitted for CanLII sources.`
        )
      }
      logger.warn(
        'REST API mode requested but CANLII_API_KEY not configured, falling back to scraping',
        { sourceSystem }
      )
      return 'scrape'
    }

    return 'rest'
  }

  if (config.apiMode === 'scrape') {
    if (isCanLIISource) {
      throw new Error(
        `CanLII source "${sourceSystem}" cannot use web scraping mode. Must use REST API (apiMode: 'rest') with valid CANLII_API_KEY and databaseId.`
      )
    }
    return 'scrape'
  }

  // Auto-detect mode for sources without explicit apiMode
  if (isCanLIISource) {
    // CanLII sources: FAIL CLOSED - require API or throw error
    if (!ENV.CANLII_API_KEY) {
      throw new Error(
        `CanLII source "${sourceSystem}" requires CANLII_API_KEY environment variable. Set CANLII_API_KEY or disable CanLII ingestion.`
      )
    }
    if (!config.databaseId) {
      throw new Error(
        `CanLII source "${sourceSystem}" requires databaseId in configuration. Add databaseId to source config.`
      )
    }
    if (!ENV.CANLII_API_ENABLED) {
      throw new Error(
        `CanLII source "${sourceSystem}" requires CANLII_API_ENABLED=true. Set environment variable or disable CanLII ingestion.`
      )
    }

    logger.info('CanLII source using REST API (required for compliance)', { sourceSystem })
    return 'rest'
  }

  // Non-CanLII sources: allow fallback to scraping
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
