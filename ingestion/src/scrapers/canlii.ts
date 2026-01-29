/**
 * CanLII HRTO Scraper
 *
 * Discovers and fetches tribunal decisions from CanLII's Human Rights Tribunal of Ontario collection.
 * Implements respectful scraping with rate limiting, error handling, and resume capability.
 */

/* eslint-disable no-console */
// Console output is intentional for CLI tool feedback

import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import type { DecisionLink, DecisionContent, SourceConfig, SourceSystem } from '../types'
import {
  RateLimiter,
  retryWithBackoff,
  sleep,
  cleanText,
  normalizeUrl,
  resolveUrl,
  parseFlexibleDate,
  isValidUrl,
  createError,
  getErrorMessage,
} from '../utils'
import { SCRAPER_CONFIG, SOURCE_CONFIGS } from '../config'

// ============================================================================
// SCRAPER CLASS
// ============================================================================

export class CanLIIScraper {
  private readonly sourceSystem: SourceSystem
  private readonly config: SourceConfig
  private readonly rateLimiter: RateLimiter
  private readonly httpClient: AxiosInstance
  private processedUrls: Set<string> = new Set()

  constructor(sourceSystem: SourceSystem = 'canlii_hrto') {
    this.sourceSystem = sourceSystem

    // Get source-specific config
    this.config = this.getSourceConfig(sourceSystem)

    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(SCRAPER_CONFIG.rateLimiter)

    // Initialize HTTP client
    this.httpClient = axios.create({
      timeout: SCRAPER_CONFIG.requestTimeoutMs,
      headers: {
        'User-Agent': SCRAPER_CONFIG.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
      },
    })
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Discovers decision links from listing pages
   *
   * @param maxCases Maximum number of decision links to discover
   * @param startPage Starting page number (for resume capability)
   * @returns Array of discovered decision links
   */
  async discoverDecisions(maxCases: number = 50, startPage: number = 1): Promise<DecisionLink[]> {
    console.log(`🔍 Discovering decisions from ${this.sourceSystem}...`)
    console.log(`   Max cases: ${maxCases}, Starting page: ${startPage}`)

    const decisions: DecisionLink[] = []
    let currentPage = startPage
    let hasMorePages = true

    while (hasMorePages && decisions.length < maxCases) {
      try {
        // Build listing URL with pagination
        const listingUrl = this.buildListingUrl(currentPage)
        console.log(`   Fetching page ${currentPage}: ${listingUrl}`)

        // Rate limit before request
        await this.rateLimiter.acquire()

        // Fetch and parse listing page
        const pageDecisions = await this.fetchListingPage(listingUrl)

        if (pageDecisions.length === 0) {
          console.log(`   No more decisions found on page ${currentPage}`)
          hasMorePages = false
          break
        }

        // Add to results (up to max)
        const remaining = maxCases - decisions.length
        const toAdd = pageDecisions.slice(0, remaining)
        decisions.push(...toAdd)

        console.log(`   Found ${toAdd.length} decisions (total: ${decisions.length})`)

        // Check if we should continue
        if (decisions.length >= maxCases) {
          console.log(`   Reached max cases limit (${maxCases})`)
          break
        }

        // Check pagination limit
        const maxPages = this.config.pagination?.maxPages || 10
        if (currentPage >= maxPages) {
          console.log(`   Reached max pages limit (${maxPages})`)
          break
        }

        currentPage++
      } catch (error) {
        console.error(`   ❌ Error on page ${currentPage}:`, getErrorMessage(error))

        // Continue to next page unless it's a critical error
        if (this.isCriticalError(error)) {
          throw error
        }

        currentPage++
      }
    }

    console.log(`✅ Discovery complete: ${decisions.length} decisions found\n`)
    return decisions
  }

  /**
   * Fetches full content for a decision URL
   *
   * @param url Decision page URL
   * @returns Extracted decision content
   */
  async fetchDecisionContent(url: string): Promise<DecisionContent> {
    // Check if already processed
    const normalizedUrl = normalizeUrl(url)
    if (this.processedUrls.has(normalizedUrl)) {
      throw createError('URL already processed', 'DUPLICATE_URL', { url })
    }

    // Rate limit before request
    await this.rateLimiter.acquire()

    console.log(`📄 Fetching decision: ${url}`)

    try {
      // Fetch with retry logic
      const html = await retryWithBackoff(
        async () => {
          const response = await this.httpClient.get(url)
          return response.data as string
        },
        SCRAPER_CONFIG.retry,
        `fetch ${url}`
      )

      // Parse content
      const content = this.parseDecisionPage(url, html)

      // Validate content
      this.validateContent(content)

      // Mark as processed
      this.processedUrls.add(normalizedUrl)

      console.log(`   ✓ Extracted ${content.textLength} characters`)

      return content
    } catch (error) {
      console.error(`   ❌ Failed to fetch decision:`, getErrorMessage(error))
      throw error
    }
  }

  /**
   * Fetches multiple decisions in sequence
   *
   * @param links Array of decision links to fetch
   * @param onProgress Optional progress callback
   * @returns Array of successfully fetched decision contents
   */
  async fetchMultipleDecisions(
    links: DecisionLink[],
    onProgress?: (current: number, total: number) => void
  ): Promise<Array<DecisionContent | Error>> {
    console.log(`📚 Fetching ${links.length} decisions...\n`)

    const results: Array<DecisionContent | Error> = []

    for (let i = 0; i < links.length; i++) {
      const link = links[i]

      try {
        const content = await this.fetchDecisionContent(link.url)
        results.push(content)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        results.push(err)
        console.error(`   ⚠️  Skipping decision ${i + 1}/${links.length}: ${err.message}\n`)
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, links.length)
      }

      // Brief pause between decisions (additional to rate limiter)
      if (i < links.length - 1) {
        await sleep(500)
      }
    }

    const successCount = results.filter((r) => !(r instanceof Error)).length
    const errorCount = results.filter((r) => r instanceof Error).length

    console.log(`\n✅ Fetch complete: ${successCount} succeeded, ${errorCount} failed`)

    return results
  }

  /**
   * Resets the scraper state (processed URLs)
   */
  reset(): void {
    this.processedUrls.clear()
    this.rateLimiter.reset()
  }

  // ==========================================================================
  // PRIVATE METHODS - LISTING PAGE
  // ==========================================================================

  /**
   * Fetches and parses a listing page
   */
  private async fetchListingPage(url: string): Promise<DecisionLink[]> {
    const html = await retryWithBackoff(
      async () => {
        const response = await this.httpClient.get(url)
        return response.data as string
      },
      SCRAPER_CONFIG.retry,
      `fetch listing ${url}`
    )

    return this.parseListingPage(url, html)
  }

  /**
   * Parses decision links from a listing page
   */
  private parseListingPage(baseUrl: string, html: string): DecisionLink[] {
    const $ = cheerio.load(html)
    const decisions: DecisionLink[] = []

    // Select decision result elements
    // CanLII structure: .result-title contains the link
    $('.result-title a, .documentlist a').each((_, element) => {
      try {
        const $elem = $(element)
        const href = $elem.attr('href')

        if (!href) return

        // Resolve relative URL
        const url = resolveUrl(baseUrl, href)

        if (!isValidUrl(url)) {
          console.warn(`   ⚠️  Invalid URL skipped: ${href}`)
          return
        }

        // Extract title
        const title = $elem.text().trim()

        // Try to find date (usually in parent or sibling)
        const $parent = $elem.closest('.result, .documentitem')
        const dateText = $parent.find('.date, .decision-date').first().text().trim()

        // Try to find preview/summary
        const preview = $parent.find('.summary, .snippet').first().text().trim()

        decisions.push({
          url,
          title: title || 'Untitled Decision',
          date: dateText || undefined,
          preview: preview || undefined,
        })
      } catch (error) {
        console.warn(`   ⚠️  Error parsing decision link:`, getErrorMessage(error))
      }
    })

    return decisions
  }

  /**
   * Builds listing URL with pagination
   */
  private buildListingUrl(page: number): string {
    if (page === 1) {
      return this.config.listingUrl
    }

    // CanLII uses ?page=N for pagination
    const url = new URL(this.config.listingUrl)
    url.searchParams.set('page', page.toString())
    return url.toString()
  }

  // ==========================================================================
  // PRIVATE METHODS - DECISION PAGE
  // ==========================================================================

  /**
   * Parses a decision page to extract content and metadata
   */
  private parseDecisionPage(url: string, html: string): DecisionContent {
    const $ = cheerio.load(html)

    // Extract main content
    // CanLII uses .documentcontent or #content for main text
    const $content = $('.documentcontent, #content, .decision-content').first()

    if ($content.length === 0) {
      throw createError('Could not find main content on page', 'PARSE_ERROR', { url })
    }

    // Remove unwanted elements
    $content.find('script, style, nav, header, footer, .ad, .navigation').remove()

    // Extract HTML and plain text
    const htmlContent = $content.html() || ''
    const fullText = cleanText($content.text())
    const textLength = fullText.length

    // Extract metadata
    const metadata = this.extractMetadata($, url)

    return {
      url,
      htmlContent,
      fullText,
      textLength,
      ...metadata,
    }
  }

  /**
   * Extracts metadata from decision page
   */
  private extractMetadata($: cheerio.CheerioAPI, url: string): Partial<DecisionContent> {
    const metadata: Partial<DecisionContent> = {}

    // Case title (usually in h1 or .case-title)
    const title = $('h1, .case-title, .document-title').first().text().trim()
    if (title) {
      metadata.caseTitle = title
    }

    // Citation (e.g., "2024 HRTO 123")
    const citation = $('.citation, .cite, [class*="citation"]').first().text().trim()
    if (citation) {
      metadata.citation = citation

      // Extract case number from citation if not found separately
      const caseMatch = citation.match(/(\d{4}\s+\w+\s+\d+)/i)
      if (caseMatch) {
        metadata.caseNumber = caseMatch[1]
      }
    }

    // Case number (separate field)
    const caseNum = $('.case-number, .file-number, [class*="file-no"]').first().text().trim()
    if (caseNum && !metadata.caseNumber) {
      metadata.caseNumber = caseNum
    }

    // Tribunal name (usually HRTO or CHRT)
    const tribunal = $('.tribunal, .court, [class*="tribunal"]').first().text().trim()
    if (tribunal) {
      metadata.tribunal = tribunal
    } else {
      // Infer from source system
      metadata.tribunal = this.sourceSystem.includes('hrto')
        ? 'Human Rights Tribunal of Ontario'
        : 'Canadian Human Rights Tribunal'
    }

    // Province
    if (this.sourceSystem.includes('hrto')) {
      metadata.province = 'ON'
    } else if (this.sourceSystem.includes('chrt')) {
      metadata.province = 'CA' // Federal
    }

    // Decision date
    const dateText = $('.decision-date, .date, [class*="date"]').first().text().trim()
    if (dateText) {
      const date = parseFlexibleDate(dateText)
      if (date) {
        metadata.decisionDate = date
      }
    }

    // Parties (applicant vs respondent)
    const parties = $('.parties, .party, [class*="parties"]').text().trim()
    if (parties) {
      // Try to split into applicant and respondent
      const vsMatch = parties.match(/(.+?)\s+(?:v\.?|vs\.?)\s+(.+)/i)
      if (vsMatch) {
        metadata.applicant = vsMatch[1].trim()
        metadata.respondent = vsMatch[2].trim()
      }
    }

    // PDF URL
    const pdfLink = $('a[href$=".pdf"], a:contains("PDF")').first().attr('href')
    if (pdfLink) {
      metadata.pdfUrl = resolveUrl(url, pdfLink)
    }

    // Language detection (simple heuristic)
    const text = $('body').text().toLowerCase()
    if (text.includes('tribunal') && text.includes('de') && text.includes('droits')) {
      metadata.language = 'fr'
    } else {
      metadata.language = 'en'
    }

    // Document type
    if (title.toLowerCase().includes('order')) {
      metadata.documentType = 'order'
    } else if (title.toLowerCase().includes('ruling')) {
      metadata.documentType = 'ruling'
    } else {
      metadata.documentType = 'decision'
    }

    return metadata
  }

  // ==========================================================================
  // PRIVATE METHODS - VALIDATION & HELPERS
  // ==========================================================================

  /**
   * Validates extracted content meets quality standards
   */
  private validateContent(content: DecisionContent): void {
    const errors: string[] = []

    // Check text length
    if (content.textLength < SCRAPER_CONFIG.minTextLength) {
      errors.push(`Text too short: ${content.textLength} < ${SCRAPER_CONFIG.minTextLength}`)
    }

    if (content.textLength > SCRAPER_CONFIG.maxTextLength) {
      errors.push(`Text too long: ${content.textLength} > ${SCRAPER_CONFIG.maxTextLength}`)
    }

    // Check required fields
    if (!content.fullText) {
      errors.push('Missing full text')
    }

    if (errors.length > 0) {
      throw createError('Content validation failed', 'VALIDATION_ERROR', {
        errors,
        url: content.url,
      })
    }
  }

  /**
   * Checks if error is critical (should stop scraping)
   */
  private isCriticalError(error: unknown): boolean {
    const message = getErrorMessage(error)

    // Network errors are usually retryable
    if (message.includes('ETIMEDOUT') || message.includes('ECONNREFUSED')) {
      return false
    }

    // 404 is not critical (page might not exist)
    if (message.includes('404')) {
      return false
    }

    // 403/401 might indicate blocking - critical
    if (message.includes('403') || message.includes('401')) {
      return true
    }

    // Rate limiting - critical
    if (message.includes('429')) {
      return true
    }

    return false
  }

  /**
   * Gets source configuration
   */
  private getSourceConfig(sourceSystem: SourceSystem): SourceConfig {
    const config = SOURCE_CONFIGS[sourceSystem as keyof typeof SOURCE_CONFIGS]

    if (!config) {
      throw createError(
        `No configuration found for source system: ${sourceSystem}. Only CanLII sources are currently configured.`,
        'CONFIG_ERROR',
        { sourceSystem }
      )
    }

    return config
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CanLIIScraper

/**
 * Factory function to create a scraper instance
 */
export function createScraper(sourceSystem: SourceSystem = 'canlii_hrto'): CanLIIScraper {
  return new CanLIIScraper(sourceSystem)
}
