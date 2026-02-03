/**
 * PR-07: CanLII Ingestion Service (Compliance-Enforced)
 *
 * Ingests legal cases from CanLII API with strict rate limit compliance:
 * - Global rate limiter (2 req/sec, 1 concurrent, 5000/day)
 * - Kill switch (CANLII_INGESTION_ENABLED env var)
 * - Database excludes document text/content (only metadata)
 * - Full tracking and audit logging
 *
 * @module lib/services/canlii-ingestion
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { withCanLIIRateLimit, canliiRateLimiter } from './canlii-rate-limiter'

// =====================================================
// Types (NO TEXT/CONTENT FIELDS - Compliance Requirement)
// =====================================================

export interface CanLIICaseMetadata {
  caseId: string
  databaseId: string
  jurisdiction: string
  court: string
  decisionDate: string
  // NO: content, text, body, full_text, document, html, etc.
  title?: string
  citation?: string
  url?: string
  // Metadata only
  judges?: string[]
  keywords?: string[]
  language?: string
}

export interface IngestionRunOptions {
  caseIds?: string[]
  dateFrom?: string
  dateTo?: string
  triggeredBy?: string
  triggerSource?: 'manual' | 'scheduled' | 'webhook' | 'api'
}

export interface IngestionRunResult {
  runId: string
  status: 'completed' | 'failed' | 'rate_limited' | 'killed'
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  casesFetched: number
  casesCreated: number
  casesUpdated: number
  casesSkipped: number
  error?: string
}

// =====================================================
// CanLII Ingestion Service
// =====================================================

class CanLIIIngestionService {
  private apiKey: string | undefined
  private baseUrl = 'https://api.canlii.org/v1'

  constructor() {
    this.apiKey = process.env.CANLII_API_KEY

    if (!this.apiKey) {
      logger.warn('CANLII_API_KEY not configured - ingestion disabled')
    }
  }

  /**
   * Check if ingestion is enabled (kill switch)
   */
  private isIngestionEnabled(): boolean {
    const enabled = process.env.CANLII_INGESTION_ENABLED

    if (enabled === undefined) {
      // Default: enabled if API key present
      return !!this.apiKey
    }

    return enabled === 'true' || enabled === '1'
  }

  /**
   * Start ingestion run
   */
  async startIngestion(options: IngestionRunOptions = {}): Promise<IngestionRunResult> {
    // Check kill switch
    if (!this.isIngestionEnabled()) {
      logger.error('CanLII ingestion disabled by kill switch')
      throw new Error('CanLII ingestion is disabled (CANLII_INGESTION_ENABLED=false)')
    }

    if (!this.apiKey) {
      throw new Error('CANLII_API_KEY not configured')
    }

    // Create ingestion run record
    const supabase = await createClient()
    const { data: run, error: runError } = await supabase
      .from('canlii_ingestion_runs')
      .insert({
        triggered_by: options.triggeredBy,
        trigger_source: options.triggerSource || 'manual',
        case_ids: options.caseIds,
        date_from: options.dateFrom,
        date_to: options.dateTo,
        status: 'running',
        kill_switch_active: false,
      })
      .select()
      .single()

    if (runError || !run) {
      throw new Error('Failed to create ingestion run')
    }

    logger.info('CanLII ingestion started', {
      run_id: run.id,
      case_ids: options.caseIds?.length,
      date_from: options.dateFrom,
      date_to: options.dateTo,
    })

    try {
      // Execute ingestion
      const result = await this.executeIngestion(run.id, options)

      // Update run status
      const supabase2 = await createClient()
      await supabase2.rpc('update_ingestion_run_status', {
        run_id: run.id,
        new_status: result.status,
        error_msg: result.error,
      })

      return {
        ...result,
        runId: run.id,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Check if kill switch was activated during run
      const killSwitchActive = !this.isIngestionEnabled()

      const supabase3 = await createClient()
      await supabase3.rpc('update_ingestion_run_status', {
        run_id: run.id,
        new_status: killSwitchActive ? 'killed' : 'failed',
        error_msg: errorMessage,
      })

      if (killSwitchActive) {
        await supabase3
          .from('canlii_ingestion_runs')
          .update({ kill_switch_active: true })
          .eq('id', run.id)
      }

      logger.error('CanLII ingestion failed', {
        run_id: run.id,
        error: errorMessage,
        kill_switch_active: killSwitchActive,
      })

      throw error
    }
  }

  /**
   * Execute ingestion (internal)
   */
  private async executeIngestion(
    runId: string,
    options: IngestionRunOptions
  ): Promise<Omit<IngestionRunResult, 'runId'>> {
    let totalRequests = 0
    let successfulRequests = 0
    let failedRequests = 0
    let casesFetched = 0
    let casesCreated = 0
    let casesUpdated = 0
    let casesSkipped = 0

    try {
      // Get list of cases to ingest
      const caseIds = options.caseIds || (await this.fetchCaseList(runId, options))

      logger.info('Ingesting CanLII cases', {
        run_id: runId,
        total_cases: caseIds.length,
      })

      // Ingest each case (sequentially - respects concurrent limit of 1)
      for (const caseId of caseIds) {
        // Check kill switch before each request
        if (!this.isIngestionEnabled()) {
          logger.warn('Kill switch activated - stopping ingestion', {
            run_id: runId,
            processed: totalRequests,
            remaining: caseIds.length - totalRequests,
          })

          return {
            status: 'killed',
            totalRequests,
            successfulRequests,
            failedRequests,
            casesFetched,
            casesCreated,
            casesUpdated,
            casesSkipped,
            error: 'Kill switch activated during ingestion',
          }
        }

        try {
          const startTime = Date.now()

          // Fetch case metadata (rate-limited)
          const caseData = await this.fetchCaseMetadata(runId, caseId)

          const duration = Date.now() - startTime
          totalRequests++
          successfulRequests++
          casesFetched++

          // Store/update case metadata
          const result = await this.storeCaseMetadata(caseData)

          if (result === 'created') casesCreated++
          else if (result === 'updated') casesUpdated++
          else casesSkipped++

          logger.info('Case ingested', {
            run_id: runId,
            case_id: caseId,
            duration_ms: duration,
            result,
          })
        } catch (error) {
          totalRequests++

          if (error instanceof Error && error.message.includes('rate limit')) {
            // Rate limit exceeded - stop ingestion
            logger.error('Rate limit exceeded - stopping ingestion', {
              run_id: runId,
              case_id: caseId,
            })

            return {
              status: 'rate_limited',
              totalRequests,
              successfulRequests,
              failedRequests,
              casesFetched,
              casesCreated,
              casesUpdated,
              casesSkipped,
              error: 'Rate limit exceeded',
            }
          }

          failedRequests++

          logger.error('Failed to ingest case', {
            run_id: runId,
            case_id: caseId,
            error: error instanceof Error ? error.message : String(error),
          })

          // Continue with next case (don't stop on individual failures)
        }
      }

      return {
        status: 'completed',
        totalRequests,
        successfulRequests,
        failedRequests,
        casesFetched,
        casesCreated,
        casesUpdated,
        casesSkipped,
      }
    } catch (error) {
      return {
        status: 'failed',
        totalRequests,
        successfulRequests,
        failedRequests,
        casesFetched,
        casesCreated,
        casesUpdated,
        casesSkipped,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Fetch list of case IDs (rate-limited)
   */
  private async fetchCaseList(runId: string, options: IngestionRunOptions): Promise<string[]> {
    // In production, this would call CanLII's /caseBrowse endpoint
    // For now, return empty array (only process explicitly provided case IDs)

    if (options.dateFrom || options.dateTo) {
      logger.warn('Date range filtering not yet implemented', {
        run_id: runId,
        date_from: options.dateFrom,
        date_to: options.dateTo,
      })
    }

    return []
  }

  /**
   * Fetch case metadata from CanLII (rate-limited, NO TEXT CONTENT)
   */
  private async fetchCaseMetadata(runId: string, caseId: string): Promise<CanLIICaseMetadata> {
    const startTime = Date.now()

    try {
      // Fetch with rate limiting
      const response = await withCanLIIRateLimit(async () => {
        return fetch(`${this.baseUrl}/caseBrowse/${caseId}?api_key=${this.apiKey}`)
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        // Record failed request
        const supabase = await createClient()
        await supabase.rpc('record_canlii_request', {
          run_id: runId,
          endpoint_path: `/caseBrowse/${caseId}`,
          case_identifier: caseId,
          response_code: response.status,
          response_time: duration,
          was_successful: false,
          was_rate_limited: response.status === 429,
          error_msg: `HTTP ${response.status}`,
        })

        throw new Error(`CanLII API error: ${response.status}`)
      }

      const data = await response.json()

      // Record successful request
      const supabase2 = await createClient()
      await supabase2.rpc('record_canlii_request', {
        run_id: runId,
        endpoint_path: `/caseBrowse/${caseId}`,
        case_identifier: caseId,
        response_code: response.status,
        response_time: duration,
        was_successful: true,
        was_rate_limited: false,
      })

      // Extract metadata only (NO TEXT/CONTENT)
      return {
        caseId: data.caseId,
        databaseId: data.databaseId,
        jurisdiction: data.jurisdiction,
        court: data.court,
        decisionDate: data.decisionDate,
        title: data.title,
        citation: data.citation,
        url: data.url,
        judges: data.judges,
        keywords: data.keywords,
        language: data.language,
        // EXPLICITLY EXCLUDED: data.content, data.text, data.body, data.html, data.document
      }
    } catch (error) {
      const duration = Date.now() - startTime

      // Record failed request
      const supabase3 = await createClient()
      await supabase3.rpc('record_canlii_request', {
        run_id: runId,
        endpoint_path: `/caseBrowse/${caseId}`,
        case_identifier: caseId,
        response_code: null,
        response_time: duration,
        was_successful: false,
        was_rate_limited: error instanceof Error && error.message.includes('rate limit'),
        error_msg: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Store case metadata (NO TEXT FIELDS)
   */
  private async storeCaseMetadata(
    caseData: CanLIICaseMetadata
  ): Promise<'created' | 'updated' | 'skipped'> {
    // Check if case exists
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('canlii_cases')
      .select('id, updated_at')
      .eq('case_id', caseData.caseId)
      .single()

    if (existing) {
      // Update metadata (NO TEXT FIELDS)
      const { error } = await supabase
        .from('canlii_cases')
        .update({
          jurisdiction: caseData.jurisdiction,
          court: caseData.court,
          decision_date: caseData.decisionDate,
          title: caseData.title,
          citation: caseData.citation,
          url: caseData.url,
          judges: caseData.judges,
          keywords: caseData.keywords,
          language: caseData.language,
          // NO: content, text, body, document, html
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        logger.error('Failed to update case', {
          case_id: caseData.caseId,
          error: error.message,
        })
        return 'skipped'
      }

      return 'updated'
    }

    // Insert new case (NO TEXT FIELDS)
    const { error } = await supabase.from('canlii_cases').insert({
      case_id: caseData.caseId,
      database_id: caseData.databaseId,
      jurisdiction: caseData.jurisdiction,
      court: caseData.court,
      decision_date: caseData.decisionDate,
      title: caseData.title,
      citation: caseData.citation,
      url: caseData.url,
      judges: caseData.judges,
      keywords: caseData.keywords,
      language: caseData.language,
      // NO: content, text, body, document, html
    })

    if (error) {
      logger.error('Failed to create case', {
        case_id: caseData.caseId,
        error: error.message,
      })
      return 'skipped'
    }

    return 'created'
  }

  /**
   * Get current ingestion stats
   */
  async getStats(): Promise<{
    dailyQuota: any
    rateLimiter: any
  }> {
    // Get daily quota
    const supabase = await createClient()
    const { data: dailyQuota } = await supabase.rpc('get_canlii_daily_quota')

    // Get rate limiter stats
    const rateLimiter = await canliiRateLimiter.getStats()

    return {
      dailyQuota: dailyQuota?.[0] || null,
      rateLimiter,
    }
  }
}

// =====================================================
// Export singleton instance
// =====================================================

export const canliiIngestion = new CanLIIIngestionService()
