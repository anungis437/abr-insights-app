/**
 * CanLII REST API Client
 *
 * Official CanLII API integration for tribunal case discovery and metadata retrieval.
 * - Base URL: https://api.canlii.org/v1
 * - Authentication: API key via query parameter
 * - Format: JSON REST API with offset-based pagination
 * - Rate Limits: Not officially documented (conservative: 2 req/sec)
 *
 * Docs: https://github.com/canlii/API_documentation/blob/master/EN.md
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { ENV } from '../config'

// ============================================================================
// TYPES
// ============================================================================

/**
 * CanLII database metadata (case or legislation)
 */
export interface CanLIIDatabase {
  databaseId: string
  jurisdiction: string
  name: string
  type?: 'CASE_LAW' | 'LEGISLATION' | 'REGULATION'
}

/**
 * CanLII case reference (minimal, from listing)
 */
export interface CanLIICaseRef {
  databaseId: string
  caseId: string
  title: string
  citation: string
  url?: string
}

/**
 * CanLII case metadata (full details)
 */
export interface CanLIICaseMetadata extends CanLIICaseRef {
  language: 'en' | 'fr'
  docketNumber?: string
  decisionDate?: string
  keywords?: string
  concatenatedId?: string
}

/**
 * CanLII case browse response (list of cases)
 */
export interface CanLIICaseBrowseResponse {
  cases: Array<{
    databaseId: string
    caseId: Record<string, string>
    title: string
    citation: string
    url?: string
  }>
}

/**
 * CanLII case metadata response
 */
export interface CanLIICaseMetadataResponse {
  databaseId: string
  caseId: string
  url: string
  title: string
  citation: string
  language: 'en' | 'fr'
  docketNumber?: string
  decisionDate?: string
  keywords?: string
  concatenatedId?: string
}

/**
 * CanLII database browse response
 */
export interface CanLIIDatabaseBrowseResponse {
  caseDatabases: CanLIIDatabase[]
}

/**
 * API Error details
 */
export interface CanLIIApiError {
  error: string
  message: string
  code?: number
}

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class CanLIIApiClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly httpClient: AxiosInstance
  private readonly language: 'en' | 'fr' = 'en'
  private requestCount = 0
  private lastRequestTime = 0

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || ENV.CANLII_API_KEY
    this.baseUrl = baseUrl || ENV.CANLII_API_BASE_URL

    // Initialize HTTP client with rate limiting headers
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'ABR-Insights-Bot/2.0 (CanLII API Client; Educational Research)',
        Accept: 'application/json',
      },
    })

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleApiError(error)
        throw error
      }
    )
  }

  // =========================================================================
  // PUBLIC METHODS
  // =========================================================================

  /**
   * Validates API connectivity and authentication
   * @returns true if API key is valid
   */
  async validateConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.warn('CanLII API validation skipped - no API key configured')
        return false
      }

      const response = await this.httpClient.get<CanLIIDatabaseBrowseResponse>(
        `/caseBrowse/${this.language}/?api_key=${this.apiKey}`
      )

      if (response.data?.caseDatabases && response.data.caseDatabases.length > 0) {
        logger.info('CanLII API connection validated', {
          databaseCount: response.data.caseDatabases.length,
        })
        return true
      }

      logger.error('CanLII API validation failed - no databases returned')
      return false
    } catch (error) {
      logger.error('CanLII API connection validation failed', { error })
      return false
    }
  }

  /**
   * Get list of all available case databases
   */
  async getCaseDatabases(): Promise<CanLIIDatabase[]> {
    try {
      if (!this.apiKey) {
        throw new Error('CANLII_API_KEY not configured')
      }

      logger.info('Fetching CanLII case databases list')

      const response = await this.call<CanLIIDatabaseBrowseResponse>(`caseBrowse/${this.language}/`)

      if (!response.caseDatabases || !Array.isArray(response.caseDatabases)) {
        throw new Error('Invalid response format: expected caseDatabases array')
      }

      logger.info('CanLII databases fetched', {
        count: response.caseDatabases.length,
      })

      return response.caseDatabases
    } catch (error) {
      logger.error('Failed to fetch CanLII databases', { error })
      throw error
    }
  }

  /**
   * Discover cases from a specific database with pagination
   * @param databaseId - CanLII database ID (e.g., "onhrt")
   * @param offset - Starting record number (0 = most recent)
   * @param resultCount - Number of results to return (1-10000)
   * @param filters - Optional date filters
   */
  async discoverCases(
    databaseId: string,
    offset: number = 0,
    resultCount: number = 100,
    filters?: {
      publishedBefore?: string // YYYY-MM-DD
      publishedAfter?: string // YYYY-MM-DD
      decisionDateBefore?: string // YYYY-MM-DD
      decisionDateAfter?: string // YYYY-MM-DD
    }
  ): Promise<CanLIICaseRef[]> {
    try {
      if (!databaseId) {
        throw new Error('databaseId is required')
      }

      if (resultCount < 1 || resultCount > 10000) {
        throw new Error('resultCount must be between 1 and 10000')
      }

      logger.info('Discovering CanLII cases', {
        databaseId,
        offset,
        resultCount,
        filters: filters ? Object.keys(filters).join(',') : 'none',
      })

      // Build query parameters
      const params = new URLSearchParams()
      params.append('offset', offset.toString())
      params.append('resultCount', resultCount.toString())

      if (filters) {
        if (filters.publishedBefore) params.append('publishedBefore', filters.publishedBefore)
        if (filters.publishedAfter) params.append('publishedAfter', filters.publishedAfter)
        if (filters.decisionDateBefore)
          params.append('decisionDateBefore', filters.decisionDateBefore)
        if (filters.decisionDateAfter) params.append('decisionDateAfter', filters.decisionDateAfter)
      }

      const response = await this.call<CanLIICaseBrowseResponse>(
        `caseBrowse/${this.language}/${databaseId}/?${params.toString()}`
      )

      if (!Array.isArray(response.cases)) {
        throw new Error('Invalid response format: expected cases array')
      }

      // Transform to unified format
      const cases: CanLIICaseRef[] = response.cases.map((c) => ({
        databaseId: c.databaseId,
        caseId: c.caseId.en || c.caseId.fr || '',
        title: c.title,
        citation: c.citation,
        url: c.url,
      }))

      logger.info('CanLII cases discovered', {
        databaseId,
        count: cases.length,
      })

      return cases
    } catch (error) {
      logger.error('Failed to discover CanLII cases', { error, databaseId, offset })
      throw error
    }
  }

  /**
   * Get detailed metadata for a specific case
   * @param databaseId - CanLII database ID
   * @param caseId - Case identifier (e.g., "2008scc9")
   */
  async getCaseMetadata(databaseId: string, caseId: string): Promise<CanLIICaseMetadata> {
    try {
      if (!databaseId || !caseId) {
        throw new Error('databaseId and caseId are required')
      }

      logger.info('Fetching CanLII case metadata', { databaseId, caseId })

      const response = await this.call<CanLIICaseMetadataResponse>(
        `caseBrowse/${this.language}/${databaseId}/${caseId}/`
      )

      const metadata: CanLIICaseMetadata = {
        databaseId: response.databaseId,
        caseId: response.caseId,
        title: response.title,
        citation: response.citation,
        url: response.url,
        language: response.language,
        docketNumber: response.docketNumber,
        decisionDate: response.decisionDate,
        keywords: response.keywords,
        concatenatedId: response.concatenatedId,
      }

      logger.info('CanLII case metadata fetched', { databaseId, caseId })

      return metadata
    } catch (error) {
      logger.error('Failed to fetch case metadata', { error, databaseId, caseId })
      throw error
    }
  }

  /**
   * Get cases that cite a specific decision (citator - "citing cases")
   * @param databaseId - CanLII database ID
   * @param caseId - Case identifier
   */
  async getCitingCases(databaseId: string, caseId: string): Promise<CanLIICaseRef[]> {
    try {
      if (!databaseId || !caseId) {
        throw new Error('databaseId and caseId are required')
      }

      logger.info('Fetching citing cases from CanLII', { databaseId, caseId })

      const response = await this.call<{
        citingCases: Array<{
          databaseId: string
          caseId: Record<string, string>
          title: string
          citation: string
        }>
      }>(`caseCitator/${this.language}/${databaseId}/${caseId}/citingCases/`)

      if (!Array.isArray(response.citingCases)) {
        return []
      }

      const cases: CanLIICaseRef[] = response.citingCases.map((c) => ({
        databaseId: c.databaseId,
        caseId: c.caseId.en || c.caseId.fr || '',
        title: c.title,
        citation: c.citation,
      }))

      logger.info('Citing cases fetched', { databaseId, caseId, count: cases.length })

      return cases
    } catch (error) {
      logger.warn('Failed to fetch citing cases - feature may not be available', {
        error,
        databaseId,
        caseId,
      })
      return []
    }
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  /**
   * Internal method to make authenticated API calls
   */
  private async call<T>(endpoint: string, options?: { rawUrl?: boolean }): Promise<T> {
    try {
      if (!this.apiKey) {
        throw new Error('CANLII_API_KEY not configured')
      }

      // Apply rate limiting (conservative: 2 requests/second)
      await this.applyRateLimit()

      // Append API key to URL
      const separator = endpoint.includes('?') ? '&' : '?'
      const url = `${endpoint}${separator}api_key=${this.apiKey}`

      logger.debug('CanLII API call', { endpoint: url.replace(this.apiKey, '***') })

      const response = await this.httpClient.get<T>(url)

      this.requestCount++
      logger.debug('CanLII API response received', {
        status: response.status,
        requestCount: this.requestCount,
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw this.parseApiError(error)
      }
      throw error
    }
  }

  /**
   * Rate limiting to respect API quotas
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    const minIntervalMs = 500 // 2 requests/second

    if (timeSinceLastRequest < minIntervalMs) {
      const delayMs = minIntervalMs - timeSinceLastRequest
      logger.debug('Rate limit delay applied', { delayMs })
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    this.lastRequestTime = Date.now()
  }

  /**
   * Parse CanLII API errors into structured format
   */
  private parseApiError(error: AxiosError<CanLIIApiError>): Error {
    const status = error.response?.status
    const data = error.response?.data

    let message = error.message

    if (data?.error === 'TOO_LONG') {
      message = `Payload too large (>10MB). Use Range requests for this content.`
    } else if (status === 401 || status === 403) {
      message = `Authentication failed: Invalid or missing API key (${data?.message || 'unauthorized'})`
    } else if (status === 404) {
      message = `Database or case not found: ${data?.message || 'resource not found'}`
    } else if (status === 429) {
      message = `Rate limited by CanLII API. Please retry after a delay.`
    } else if (data?.message) {
      message = data.message
    }

    const error_with_code = new Error(message)
    ;(error_with_code as any).code = status
    ;(error_with_code as any).originalError = data

    return error_with_code
  }

  /**
   * Generic error handler for all API errors
   */
  private handleApiError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data as CanLIIApiError | undefined

      if (status === 401 || status === 403) {
        logger.error('CanLII API authentication error', { status, message: data?.message })
      } else if (status === 429) {
        logger.warn('CanLII API rate limited', {
          retryAfter: error.response?.headers['retry-after'],
        })
      } else if (status === 500) {
        logger.error('CanLII API server error', { status, message: data?.message })
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CanLIIApiClient

/**
 * Singleton instance
 */
let clientInstance: CanLIIApiClient | null = null

export function getCanLIIClient(): CanLIIApiClient {
  if (!clientInstance) {
    clientInstance = new CanLIIApiClient()
  }
  return clientInstance
}
