/**
 * Ingestion Pipeline Orchestrator
 *
 * Coordinates the entire ingestion workflow:
 * 1. Discovery - Find new cases to ingest
 * 2. Fetch - Download decision content
 * 3. Classify - Analyze with rule-based + AI
 * 4. Store - Save to database
 *
 * Features:
 * - Job tracking with metrics
 * - Error handling and logging
 * - Resume capability
 * - Idempotency (skip already processed)
 * - Progress reporting
 * - Dry-run mode
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  IngestionJob,
  JobType,
  JobStatus,
  IngestionError,
  ErrorStage,
  ErrorSeverity,
  SourceSystem,
  SourceConfig,
  DecisionLink,
  DecisionContent,
  RawCaseRecord,
  CombinedClassification,
  PipelineContext,
} from '../types'
import { ENV } from '../config'
import { createScraper } from '../scrapers/factory'
import { CombinedClassifier } from '../classifiers/combined'
import { createError, getErrorMessage, ProgressBar } from '../utils'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

interface OrchestrationOptions {
  /** Job type for tracking */
  jobType?: JobType
  /** Resume from last checkpoint */
  resume?: boolean
  /** Dry run - don't save to DB */
  dryRun?: boolean
  /** Limit number of cases to process */
  limit?: number
  /** User/system that triggered job */
  triggeredBy?: string
  /** Maximum date to scrape (for historical backfills) */
  maxDate?: Date
  /** Minimum date to scrape */
  minDate?: Date
  /** Progress callback */
  onProgress?: (context: PipelineContext) => void
}

interface OrchestrationResult {
  jobId: string
  status: JobStatus
  metrics: {
    discovered: number
    fetched: number
    classified: number
    stored: number
    failed: number
    skipped: number
  }
  duration: number
  errors: Array<{ stage: ErrorStage; message: string; url?: string }>
}

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class IngestionOrchestrator {
  private supabase: SupabaseClient
  private scraper: any = null
  private classifier: CombinedClassifier
  private jobId: string | null = null
  private startTime: number = 0

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY)
    // Scraper will be initialized in run() with proper source config via factory
    this.classifier = new CombinedClassifier()
  }

  /**
   * Runs the complete ingestion pipeline
   */
  async run(
    sourceSystem: SourceSystem,
    sourceConfig: SourceConfig,
    options: OrchestrationOptions = {}
  ): Promise<OrchestrationResult> {
    this.startTime = Date.now()

    const metrics = {
      discovered: 0,
      fetched: 0,
      classified: 0,
      stored: 0,
      failed: 0,
      skipped: 0,
    }

    const errors: Array<{ stage: ErrorStage; message: string; url?: string }> = []

    try {
      // Step 0: Initialize scraper with source-specific config using factory
      this.scraper = await createScraper(sourceSystem, sourceConfig)

      // Step 1: Initialize job
      if (!options.dryRun) {
        this.jobId = await this.initializeJob(sourceSystem, sourceConfig, options)
        console.log(`\n🚀 Started ingestion job: ${this.jobId}`)
      } else {
        console.log('\n🔍 Running in DRY RUN mode - no data will be saved')
      }

      // Step 2: Get resume checkpoint if needed
      let processedUrls = new Set<string>()
      if (options.resume && this.jobId) {
        processedUrls = await this.getProcessedUrls(sourceSystem)
        console.log(`📋 Resume mode: ${processedUrls.size} URLs already processed`)
      }

      // Step 3: Discovery - Find cases
      console.log(`\n📡 Discovery: Fetching case list from ${sourceSystem}...`)
      const links = await this.discoverCases(sourceSystem, sourceConfig, options)
      metrics.discovered = links.length
      console.log(`✅ Discovered ${links.length} cases`)

      // Filter out already processed
      const toProcess = links.filter((link) => !processedUrls.has(link.url))
      metrics.skipped = links.length - toProcess.length

      if (metrics.skipped > 0) {
        console.log(`⏭️  Skipping ${metrics.skipped} already processed cases`)
      }

      // Apply limit
      const finalList = options.limit ? toProcess.slice(0, options.limit) : toProcess
      console.log(`\n🎯 Processing ${finalList.length} cases\n`)

      // Step 4: Process each case
      const progressBar = new ProgressBar(finalList.length, 'Processing cases')

      for (let i = 0; i < finalList.length; i++) {
        const link = finalList[i]

        try {
          // Fetch content
          const content = await this.fetchCase(link.url)
          metrics.fetched++

          // Classify
          const classification = await this.classifyCase(content)
          metrics.classified++

          // Store
          if (!options.dryRun) {
            await this.storeCase(content, classification, sourceSystem, sourceConfig)
            metrics.stored++

            // Update job checkpoint
            if (this.jobId) {
              await this.updateCheckpoint(this.jobId, link.url)
            }
          }
        } catch (error) {
          metrics.failed++
          const errorMsg = getErrorMessage(error)
          errors.push({ stage: 'fetch', message: errorMsg, url: link.url })

          // Log error to database
          if (!options.dryRun && this.jobId) {
            await this.logError(this.jobId, 'fetch', error, { url: link.url })
          }

          console.error(`\n❌ Failed to process ${link.url}: ${errorMsg}`)
        }

        // Update progress
        progressBar.update(i + 1)

        if (options.onProgress) {
          options.onProgress({
            job: {} as IngestionJob, // Simplified for now
            config: sourceConfig,
            dryRun: options.dryRun || false,
            verbose: false,
            processedUrls,
            errors: [],
          })
        }
      }

      progressBar.complete()

      // Step 5: Finalize job
      const duration = Math.floor((Date.now() - this.startTime) / 1000)
      const status: JobStatus =
        metrics.failed === finalList.length
          ? 'failed'
          : metrics.failed > 0
            ? 'partial'
            : 'completed'

      if (!options.dryRun && this.jobId) {
        await this.finalizeJob(this.jobId, status, metrics, duration)
      }

      // Step 6: Print summary
      this.printSummary(status, metrics, duration, errors)

      return {
        jobId: this.jobId || 'dry-run',
        status,
        metrics,
        duration,
        errors,
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error)
      console.error(`\n💥 Pipeline failed: ${errorMsg}`)

      if (!options.dryRun && this.jobId) {
        await this.finalizeJob(
          this.jobId,
          'failed',
          metrics,
          Math.floor((Date.now() - this.startTime) / 1000),
          errorMsg
        )
      }

      throw error
    }
  }

  // ==========================================================================
  // STAGE 1: DISCOVERY
  // ==========================================================================

  /**
   * Discovers cases to ingest
   */
  private async discoverCases(
    sourceSystem: SourceSystem,
    sourceConfig: SourceConfig,
    options: OrchestrationOptions
  ): Promise<DecisionLink[]> {
    try {
      // Support all CanLII sources (any source starting with 'canlii_')
      const isCanLII = sourceSystem.startsWith('canlii_')
      const isDirect = sourceSystem.endsWith('_direct')

      if (!isCanLII && !isDirect) {
        throw createError(`Unsupported source system: ${sourceSystem}`, 'UNSUPPORTED_SOURCE')
      }

      // Direct scraping not yet implemented
      if (isDirect) {
        throw createError(
          `Direct scraping not yet implemented for: ${sourceSystem}`,
          'UNSUPPORTED_SOURCE'
        )
      }

      // Discover cases from CanLII (default max 50)
      if (!this.scraper) {
        throw createError('Scraper not initialized', 'INTERNAL_ERROR')
      }
      const links = await this.scraper.discoverDecisions(options.limit || 50)

      return links
    } catch (error) {
      throw createError(`Discovery failed: ${getErrorMessage(error)}`, 'DISCOVERY_ERROR', {
        sourceSystem,
      })
    }
  }

  // ==========================================================================
  // STAGE 2: FETCH
  // ==========================================================================

  /**
   * Fetches case content
   */
  private async fetchCase(url: string): Promise<DecisionContent> {
    try {
      if (!this.scraper) {
        throw createError('Scraper not initialized', 'INTERNAL_ERROR')
      }
      const content = await this.scraper.fetchDecisionContent(url)
      return content
    } catch (error) {
      throw createError(`Fetch failed: ${getErrorMessage(error)}`, 'FETCH_ERROR', { url })
    }
  }

  // ==========================================================================
  // STAGE 3: CLASSIFY
  // ==========================================================================

  /**
   * Classifies case
   */
  private async classifyCase(content: DecisionContent): Promise<CombinedClassification> {
    try {
      const classification = await this.classifier.classify(content)
      return classification
    } catch (error) {
      throw createError(
        `Classification failed: ${getErrorMessage(error)}`,
        'CLASSIFICATION_ERROR',
        { url: content.url }
      )
    }
  }

  // ==========================================================================
  // STAGE 4: STORE
  // ==========================================================================

  /**
   * Stores case in database
   */
  private async storeCase(
    content: DecisionContent,
    classification: CombinedClassification,
    sourceSystem: SourceSystem,
    sourceConfig: SourceConfig
  ): Promise<void> {
    try {
      const record: any = {
        // Source
        source_url: content.url,
        source_system: sourceSystem,
        source_id: content.caseNumber,

        // Content
        case_title: content.caseTitle,
        case_number: content.caseNumber,
        tribunal_name: content.tribunal,
        decision_date: content.decisionDate,
        applicant: content.applicant,
        respondent: content.respondent,
        citation: content.citation,
        full_text: content.fullText,
        text_length: content.fullText.length,
        document_type: 'decision',

        // Classification - Store as JSONB
        rule_based_classification: {
          isRaceRelated: classification.ruleBasedResult.isRaceRelated,
          isAntiBlackLikely: classification.ruleBasedResult.isAntiBlackLikely,
          confidence: classification.ruleBasedResult.confidence,
          category: classification.finalCategory,
          groundsDetected: classification.ruleBasedResult.groundsDetected,
          keywordMatches: classification.ruleBasedResult.keywordMatches,
          reasoning: classification.ruleBasedResult.reasoning,
        },

        // AI Classification - Store as JSONB if available
        ai_classification: classification.aiResult
          ? {
              category: classification.aiResult.category,
              confidence: classification.aiResult.confidence,
              reasoning: classification.aiResult.reasoning,
              keyPhrases: classification.aiResult.keyPhrases,
              groundsDetected: classification.aiResult.groundsDetected,
              keyIssues: classification.aiResult.keyIssues,
              remedies: classification.aiResult.remedies,
              sentiment: classification.aiResult.sentiment,
              legislationCited: classification.aiResult.legislationCited,
            }
          : null,

        // Combined confidence and review flag
        combined_confidence: classification.finalConfidence,
        needs_review: classification.needsReview,

        // Store grounds and issues for querying
        discrimination_grounds: classification.ruleBasedResult.groundsDetected,
        key_issues: classification.aiResult?.keyIssues || [],
        remedies: classification.aiResult?.remedies || [],
      }

      // Insert into tribunal_cases_raw first
      const { error: rawError } = await this.supabase.from('tribunal_cases_raw').upsert(record, {
        onConflict: 'source_url',
        ignoreDuplicates: false,
      })

      if (rawError) {
        throw rawError
      }

      // Also insert into simplified cases table for the web app
      const caseRecord = {
        source_url: content.url,
        source_system: sourceSystem,
        case_title: content.caseTitle,
        case_number: content.caseNumber,
        citation: content.citation,
        tribunal_name: content.tribunal,
        decision_date: content.decisionDate,
        applicant: content.applicant,
        respondent: content.respondent,
        full_text: content.fullText,
        document_type: 'decision',
        rule_based_classification: {
          category: classification.finalCategory,
          confidence: classification.ruleBasedResult.confidence,
        },
        ai_classification: classification.aiResult
          ? {
              category: classification.aiResult.category,
              confidence: classification.aiResult.confidence,
            }
          : null,
        combined_confidence: classification.finalConfidence,
        needs_review: classification.needsReview,
      }

      const { error: caseError } = await this.supabase.from('cases').upsert(caseRecord, {
        onConflict: 'source_url',
        ignoreDuplicates: false,
      })

      if (caseError) {
        // Log but don't fail if cases table doesn't exist yet
        console.warn(`Warning: Could not insert into cases table:`, caseError)
      }
    } catch (error) {
      // Better error message for Supabase errors
      const errorMsg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
            ? JSON.stringify(error, null, 2)
            : String(error)

      throw createError(`Storage failed: ${errorMsg}`, 'STORAGE_ERROR', { url: content.url })
    }
  }

  // ==========================================================================
  // JOB MANAGEMENT
  // ==========================================================================

  /**
   * Initializes a new ingestion job
   */
  private async initializeJob(
    sourceSystem: SourceSystem,
    sourceConfig: SourceConfig,
    options: OrchestrationOptions
  ): Promise<string> {
    const job = {
      job_type: options.jobType || 'manual',
      source_system: sourceSystem,
      source_config: sourceConfig,
      status: 'running' as const,
      started_at: new Date().toISOString(),
      cases_discovered: 0,
      cases_fetched: 0,
      cases_classified: 0,
      cases_stored: 0,
      cases_failed: 0,
      high_confidence_count: 0,
      medium_confidence_count: 0,
      low_confidence_count: 0,
      execution_environment: 'local',
      pipeline_version: '1.0.0',
    }

    const { data, error } = await this.supabase
      .from('ingestion_jobs')
      .insert(job)
      .select('id')
      .single()

    if (error || !data) {
      throw createError('Failed to create job', 'JOB_INIT_ERROR', { error })
    }

    return data.id
  }

  /**
   * Updates job checkpoint for resume capability
   */
  private async updateCheckpoint(jobId: string, lastUrl: string): Promise<void> {
    await this.supabase
      .from('ingestion_jobs')
      .update({
        last_processed_url: lastUrl,
        checkpoint_data: { lastUpdate: new Date().toISOString() },
      })
      .eq('id', jobId)
  }

  /**
   * Finalizes job with metrics
   */
  private async finalizeJob(
    jobId: string,
    status: JobStatus,
    metrics: OrchestrationResult['metrics'],
    duration: number,
    errorMessage?: string
  ): Promise<void> {
    const updates = {
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      cases_discovered: metrics.discovered,
      cases_fetched: metrics.fetched,
      cases_classified: metrics.classified,
      cases_stored: metrics.stored,
      cases_failed: metrics.failed,
      error_message: errorMessage,
    }

    // Calculate confidence distribution
    if (metrics.stored > 0) {
      const { data } = await this.supabase
        .from('tribunal_cases_raw')
        .select('final_confidence')
        .gte('scraped_at', new Date(this.startTime))

      if (data) {
        const confidences = data.map((r) => r.final_confidence || 0)
        Object.assign(updates, {
          avg_confidence_score: confidences.reduce((a, b) => a + b, 0) / confidences.length,
          high_confidence_count: confidences.filter((c) => c >= 0.8).length,
          medium_confidence_count: confidences.filter((c) => c >= 0.5 && c < 0.8).length,
          low_confidence_count: confidences.filter((c) => c < 0.5).length,
        })
      }
    }

    await this.supabase.from('ingestion_jobs').update(updates).eq('id', jobId)
  }

  /**
   * Logs an error to the database
   */
  private async logError(
    jobId: string,
    stage: ErrorStage,
    error: unknown,
    context?: Record<string, any>
  ): Promise<void> {
    const severity: ErrorSeverity = stage === 'storage' ? 'critical' : 'error'

    const errorRecord: any = {
      job_id: jobId,
      stage,
      severity,
      error_message: getErrorMessage(error),
      error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
      context,
      occurred_at: new Date(),
    }

    await this.supabase.from('ingestion_errors').insert(errorRecord)
  }

  /**
   * Gets already processed URLs for resume
   */
  private async getProcessedUrls(sourceSystem: SourceSystem): Promise<Set<string>> {
    const { data } = await this.supabase
      .from('tribunal_cases_raw')
      .select('source_url')
      .eq('source_system', sourceSystem)
      .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days

    return new Set(data?.map((r) => r.source_url) || [])
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Prints execution summary
   */
  private printSummary(
    status: JobStatus,
    metrics: OrchestrationResult['metrics'],
    duration: number,
    errors: Array<{ stage: ErrorStage; message: string; url?: string }>
  ): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 INGESTION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Status: ${status.toUpperCase()}`)
    console.log(`Duration: ${duration}s`)
    console.log('')
    console.log('Metrics:')
    console.log(`  Discovered: ${metrics.discovered}`)
    console.log(`  Skipped:    ${metrics.skipped}`)
    console.log(`  Fetched:    ${metrics.fetched}`)
    console.log(`  Classified: ${metrics.classified}`)
    console.log(`  Stored:     ${metrics.stored}`)
    console.log(`  Failed:     ${metrics.failed}`)

    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.slice(0, 5).forEach((err) => {
        console.log(`  - [${err.stage}] ${err.message}`)
        if (err.url) console.log(`    URL: ${err.url}`)
      })

      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more errors`)
      }
    }

    console.log('='.repeat(60) + '\n')
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Creates an orchestrator instance
 */
export function createOrchestrator(supabase?: SupabaseClient): IngestionOrchestrator {
  return new IngestionOrchestrator(supabase)
}

/**
 * Quick run helper
 */
export async function runIngestion(
  sourceSystem: SourceSystem,
  sourceConfig: SourceConfig,
  options?: OrchestrationOptions
): Promise<OrchestrationResult> {
  const orchestrator = new IngestionOrchestrator()
  return orchestrator.run(sourceSystem, sourceConfig, options)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default IngestionOrchestrator
