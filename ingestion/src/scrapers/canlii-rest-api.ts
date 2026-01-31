/**
 * CanLII REST API Scraper
 *
 * Official CanLII REST API implementation replacing web scraping.
 * Features:
 * - Offset-based pagination
 * - JSON responses
 * - Production-grade error handling
 * - Rate limiting (2 req/sec)
 * - Logging & diagnostics
 * - Type-safe client integration
 *
 * Migration Path:
 * 1. Both scrapers (web + API) can coexist
 * 2. Configure via `apiMode: 'rest'` in SOURCE_CONFIGS
 * 3. Gradual rollout per tribunal
 * 4. Full migration when all databaseIds verified
 */

import type { DecisionLink, DecisionContent, SourceConfig, SourceSystem } from '../types'
import { CanLIIApiClient, type CanLIICaseRef, type CanLIICaseMetadata } from '../clients/canlii-api'
import { logger } from '../utils/logger'
import { cleanText, parseFlexibleDate } from '../utils'
import { RateLimiter } from '../utils'
import { SCRAPER_CONFIG } from '../config'
import axios from 'axios'

// ============================================================================
// TYPES
// ============================================================================

interface ApiScraperOptions {
  maxCases?: number
  startOffset?: number
  dateFilter?: {
    after?: Date
    before?: Date
  }
}

// ============================================================================
// API SCRAPER CLASS
// ============================================================================

export class CanLIIRestApiScraper {
  private readonly sourceSystem: SourceSystem
  private readonly config: SourceConfig
  private readonly client: CanLIIApiClient
  private readonly rateLimiter: RateLimiter
  private databaseId: string = ''

  constructor(sourceSystem: SourceSystem, config: SourceConfig, apiClient?: CanLIIApiClient) {
    this.sourceSystem = sourceSystem
    this.config = config
    this.client = apiClient || new CanLIIApiClient()
    this.rateLimiter = new RateLimiter(SCRAPER_CONFIG.rateLimiter)

    if (!config.databaseId) {
      logger.warn('CanLII REST API scraper initialized without databaseId', {
        sourceSystem,
      })
    } else {
      this.databaseId = config.databaseId
    }
  }

  // =========================================================================
  // PUBLIC METHODS
  // =========================================================================

  /**
   * Discover decision links using REST API pagination
   * @param maxCases Maximum number of decisions to discover
   * @param startOffset Starting offset (0 = most recent)
   * @returns Array of decision links with metadata
   */
  async discoverDecisions(maxCases: number = 50, startOffset: number = 0): Promise<DecisionLink[]> {
    try {
      if (!this.databaseId) {
        throw new Error(`Database ID not configured for ${this.sourceSystem}`)
      }

      logger.info(`🔍 Discovering decisions from ${this.sourceSystem} via REST API...`, {
        maxCases,
        startOffset,
        databaseId: this.databaseId,
      })

      const decisions: DecisionLink[] = []
      let currentOffset = startOffset
      const pageSize = 100 // CanLII default page size

      while (decisions.length < maxCases) {
        try {
          // Rate limit
          await this.rateLimiter.acquire()

          // Fetch page
          const remaining = maxCases - decisions.length
          const count = Math.min(pageSize, remaining)

          logger.debug(`Fetching page: offset=${currentOffset}, count=${count}`)

          const cases = await this.client.discoverCases(this.databaseId, currentOffset, count)

          if (!cases || cases.length === 0) {
            logger.info('No more decisions available', { lastOffset: currentOffset })
            break
          }

          // Convert API cases to decision links
          const links = cases.map((c: CanLIICaseRef) => this.caseRefToDecisionLink(c))
          decisions.push(...links)

          logger.info(`Discovered ${links.length} decisions (total: ${decisions.length})`)

          // If we got fewer results than requested, we've reached the end
          if (cases.length < count) {
            logger.info('Reached end of available decisions', {
              lastBatch: cases.length,
              expected: count,
            })
            break
          }

          currentOffset += count
        } catch (error) {
          logger.error('Error fetching decision page', { error, offset: currentOffset })
          // Continue to next page on error
          currentOffset += pageSize
        }
      }

      logger.info(`✅ Discovery complete: ${decisions.length} decisions found`)
      return decisions
    } catch (error) {
      logger.error('Failed to discover decisions via REST API', {
        error,
        sourceSystem: this.sourceSystem,
      })
      throw error
    }
  }

  /**
   * Fetch full content for a decision URL via REST API
   * In metadata-only mode, returns only API metadata (compliant with CanLII)
   * In full-text mode, falls back to web scraping for full text
   * @param url Decision page URL
   * @returns Extracted decision content
   */
  async fetchDecisionContent(url: string): Promise<DecisionContent> {
    try {
      logger.debug(`Fetching decision content from ${url}`)

      // Extract caseId from URL (format: https://canlii.ca/t/XXXXX)
      const caseIdMatch = url.match(/\/t\/([a-z0-9]+)$/i)
      if (!caseIdMatch) {
        throw new Error(`Could not extract caseId from URL: ${url}`)
      }

      const caseId = caseIdMatch[1]
      
      // Rate limit API calls
      await this.rateLimiter.acquire()

      // Fetch metadata via API
      const metadata = await this.client.getCaseMetadata(this.databaseId, caseId)

      // Get full text only if explicitly configured
      const fetchMode = process.env.CANLII_FETCH_MODE || 'metadata-only'
      let fullText = ''
      
      if (fetchMode === 'full-text') {
        logger.warn('Fetching full text via web scraping (not API-compliant)', { caseId })
        fullText = await this.fetchFullTextFromWeb(url)
      } else {
        // Metadata-only mode: use title + available summary/keywords
        logger.info('Using metadata-only mode (CanLII compliant)', { caseId })
        fullText = this.buildTextFromMetadata(metadata)
      }

      const content: DecisionContent = {
        url,
        htmlContent: '', // Not available from API
        fullText,
        textLength: fullText.length,
        caseNumber: metadata.docketNumber || caseId,
        caseTitle: metadata.title,
        tribunal: this.config.baseUrl,
        decisionDate: metadata.decisionDate ? new Date(metadata.decisionDate) : undefined,
        citation: metadata.citation,
        language: metadata.language,
        applicant: undefined,
        respondent: undefined,
      }

      logger.debug('Decision content fetched via REST API', {
        caseId,
        contentLength: fullText.length,
        mode: fetchMode,
      })

      return content
    } catch (error) {
      logger.error('Failed to fetch decision content via REST API', {
        error,
        url,
      })
      throw error
    }
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  /**
   * Build searchable text from metadata only (compliant approach)
   * Uses title, keywords, and other metadata fields
   */
  private buildTextFromMetadata(metadata: CanLIICaseMetadata): string {
    const parts: string[] = []
    
    // Add title (most important)
    if (metadata.title) {
      parts.push(metadata.title)
    }
    
    // Add citation if available
    if (metadata.citation) {
      parts.push(metadata.citation)
    }
    
    // Add docket number
    if (metadata.docketNumber) {
      parts.push(`Docket: ${metadata.docketNumber}`)
    }
    
    // Add keywords if available (note: keywords is a string, not array)
    if (metadata.keywords) {
      parts.push(`Keywords: ${metadata.keywords}`)
    }
    
    // Note: This is metadata-only content
    parts.push('[Metadata-only content - Full text not included per CanLII compliance]')
    
    return parts.join('\n\n')
  }

  /**
   * Convert CanLII case reference to our decision link format
   */
  private caseRefToDecisionLink(caseRef: CanLIICaseRef): DecisionLink {
    return {
      url: caseRef.url || `https://canlii.ca/t/${caseRef.caseId}`,
      title: caseRef.title,
      date: undefined, // Date not in basic case ref, would need metadata call
    }
  }

  /**
   * Fetch full text content from CanLII web
   * Uses web scraping because API only returns metadata
   * @param url Case URL
   * @returns Full text content
   */
  private async fetchFullTextFromWeb(url: string): Promise<string> {
    try {
      logger.debug('Fetching full text from CanLII web page', { url })

      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': SCRAPER_CONFIG.userAgent,
        },
      })

      // Extract text from HTML
      // This is a basic extraction; adjust selector based on CanLII page structure
      const html = response.data
      const textMatch = html.match(
        /<div[^>]*class="[^"]*document-content[^"]*"[^>]*>(.*?)<\/div>/is
      )

      if (textMatch) {
        const text = textMatch[1]
          .replace(/<[^>]+>/g, ' ') // Remove HTML tags
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim()

        return cleanText(text)
      }

      // Fallback: extract all text
      const allText = html
        .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
        .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove styles
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ')
        .trim()

      return cleanText(allText)
    } catch (error) {
      logger.warn('Failed to fetch full text from web', { error, url })
      return '' // Return empty string if unable to fetch
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Factory function to create API scraper
 */
export function createApiScraper(
  sourceSystem: SourceSystem,
  config: SourceConfig,
  apiClient?: CanLIIApiClient
): CanLIIRestApiScraper {
  return new CanLIIRestApiScraper(sourceSystem, config, apiClient)
}
