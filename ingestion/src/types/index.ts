/**
 * Ingestion Module - Type Definitions
 *
 * Centralized TypeScript types for the tribunal case ingestion pipeline.
 * Ensures type safety across scrapers, classifiers, and storage layers.
 */

// ============================================================================
// SOURCE & SCRAPING TYPES
// ============================================================================

/**
 * Supported source systems for tribunal case ingestion
 */
export type SourceSystem =
  // Federal
  | 'canlii_chrt' // CanLII - Canadian Human Rights Tribunal
  | 'chrt_direct' // Direct CHRT website

  // Ontario
  | 'canlii_hrto' // CanLII - Human Rights Tribunal of Ontario
  | 'hrto_direct' // Direct HRTO website

  // British Columbia
  | 'canlii_bchrt' // CanLII - BC Human Rights Tribunal
  | 'bchrt_direct' // Direct BCHRT website

  // Alberta
  | 'canlii_abhr' // CanLII - Alberta Human Rights Commission
  | 'abhr_direct' // Direct Alberta website

  // Saskatchewan
  | 'canlii_skhr' // CanLII - Saskatchewan Human Rights Commission
  | 'skhr_direct' // Direct Saskatchewan website

  // Manitoba
  | 'canlii_mbhr' // CanLII - Manitoba Human Rights Commission
  | 'mbhr_direct' // Direct Manitoba website

  // Quebec
  | 'canlii_qctdp' // CanLII - Quebec Tribunal des droits de la personne
  | 'qctdp_direct' // Direct Quebec website

  // Atlantic Provinces
  | 'canlii_nbhr' // CanLII - New Brunswick Human Rights
  | 'canlii_nshr' // CanLII - Nova Scotia Human Rights
  | 'canlii_peihr' // CanLII - PEI Human Rights
  | 'canlii_nlhr' // CanLII - Newfoundland & Labrador Human Rights

  // Territories
  | 'canlii_ythr' // CanLII - Yukon Human Rights
  | 'canlii_nthr' // CanLII - Northwest Territories Human Rights
  | 'canlii_nuhr' // CanLII - Nunavut Human Rights

/**
 * Configuration for a scraping source
 */
export interface SourceConfig {
  sourceSystem: SourceSystem
  baseUrl: string
  listingUrl: string
  maxPages?: number
  maxCasesPerPage?: number
  startDate?: Date
  endDate?: Date
  filters?: Record<string, string>
  selectors?: {
    listingResults?: string
    resultDate?: string
    resultPreview?: string
    contentContainer?: string
    caseNumber?: string
    tribunal?: string
    decisionDate?: string
    parties?: string
  }
  pagination?: {
    enabled: boolean
    paramName?: string
    maxPages?: number
  }
}

/**
 * A discovered decision link from listing pages
 */
export interface DecisionLink {
  url: string
  title: string
  date?: string
  caseNumber?: string
  tribunal?: string
  preview?: string // Short excerpt if available
}

/**
 * Fetched content from a decision page
 */
export interface DecisionContent {
  url: string
  htmlContent: string
  fullText: string
  textLength: number

  // Extracted metadata
  id?: string // Source system ID
  caseNumber?: string
  caseTitle?: string
  title?: string // Alias for caseTitle
  tribunal?: string
  province?: string
  decisionDate?: Date
  date?: string // String format date
  filingDate?: Date
  applicant?: string
  respondent?: string
  citation?: string
  pdfUrl?: string
  language?: 'en' | 'fr' | 'unknown'
  documentType?: string
}

// ============================================================================
// CLASSIFICATION TYPES
// ============================================================================

/**
 * Discrimination grounds recognized in Canadian human rights law
 */
export type DiscriminationGround =
  | 'race'
  | 'colour'
  | 'ancestry'
  | 'place_of_origin'
  | 'ethnic_origin'
  | 'citizenship'
  | 'creed'
  | 'sex'
  | 'sexual_orientation'
  | 'gender_identity'
  | 'gender_expression'
  | 'age'
  | 'marital_status'
  | 'family_status'
  | 'disability'
  | 'receipt_of_public_assistance'
  | 'record_of_offences'

/**
 * Result from rule-based classification
 */
export interface RuleBasedClassification {
  isRaceRelated: boolean
  isAntiBlackLikely: boolean
  confidence: number // 0-1
  groundsDetected: DiscriminationGround[]
  keywordMatches: {
    raceKeywords: string[]
    blackKeywords: string[]
    discriminationKeywords: string[]
  }
  reasoning: string
}

/**
 * Result from AI-powered classification
 */
export interface AIClassification {
  category: 'anti_black_racism' | 'other_discrimination' | 'non_discrimination'
  confidence: number // 0-1
  reasoning: string
  keyPhrases: string[]
  groundsDetected: DiscriminationGround[]
  keyIssues: string[]
  remedies: string[]
  sentiment?: 'favorable' | 'unfavorable' | 'mixed' | 'neutral'
  legislationCited?: string[]
}

/**
 * Combined classification result
 */
export interface CombinedClassification {
  ruleBasedResult: RuleBasedClassification
  aiResult: AIClassification
  finalConfidence: number // Weighted average
  finalCategory: AIClassification['category']
  needsReview: boolean // True if confidence < threshold or disagreement
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

/**
 * Raw case record for database insertion
 */
export interface RawCaseRecord {
  // Source
  sourceUrl: string
  sourceSystem: SourceSystem
  sourceId?: string

  // Case identification
  caseNumber?: string
  caseTitle?: string
  citation?: string

  // Tribunal
  tribunalName?: string
  tribunalProvince?: string
  decisionDate?: Date
  filingDate?: Date

  // Parties
  applicant?: string
  respondent?: string

  // Content
  htmlContent?: string
  fullText: string
  textLength: number

  // Metadata
  documentType?: string
  language?: 'en' | 'fr' | 'unknown'
  pdfUrl?: string

  // Classification
  ruleBasedClassification: Record<string, any>
  aiClassification: Record<string, any>
  combinedConfidence: number
  discriminationGrounds: DiscriminationGround[]
  keyIssues?: string[]
  remedies?: string[]

  // Quality
  extractionQuality: 'high' | 'medium' | 'low' | 'failed'
  extractionErrors: string[]
  needsReview: boolean

  // Job reference
  ingestionJobId: string
}

/**
 * Promotion status for raw cases
 */
export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'promoted' | 'duplicate'

// ============================================================================
// JOB MANAGEMENT TYPES
// ============================================================================

/**
 * Ingestion job type
 */
export type JobType = 'manual' | 'scheduled' | 'retry' | 'backfill'

/**
 * Ingestion job status
 */
export type JobStatus = 'pending' | 'running' | 'completed' | 'partial' | 'failed' | 'cancelled'

/**
 * Ingestion job record
 */
export interface IngestionJob {
  id: string
  jobType: JobType
  sourceSystem: SourceSystem
  sourceConfig: SourceConfig
  status: JobStatus

  // Timestamps
  startedAt?: Date
  completedAt?: Date
  durationSeconds?: number

  // Metrics
  casesDiscovered: number
  casesFetched: number
  casesClassified: number
  casesStored: number
  casesFailed: number

  // Quality metrics
  avgConfidenceScore?: number
  highConfidenceCount: number
  mediumConfidenceCount: number
  lowConfidenceCount: number

  // Error tracking
  errorMessage?: string
  errorDetails?: Record<string, any>

  // Context
  triggeredBy?: string
  executionEnvironment: 'local' | 'azure_function' | 'github_action'
  pipelineVersion: string

  // Resume
  lastProcessedUrl?: string
  checkpointData?: Record<string, any>
}

/**
 * Ingestion error stage
 */
export type ErrorStage = 'discovery' | 'fetch' | 'extraction' | 'classification' | 'storage'

/**
 * Error severity level
 */
export type ErrorSeverity = 'warning' | 'error' | 'critical'

/**
 * Ingestion error record
 */
export interface IngestionError {
  id: string
  ingestionJobId: string
  rawCaseId?: string

  errorStage: ErrorStage
  errorType: string
  errorMessage: string
  errorStack?: string

  sourceUrl?: string
  requestPayload?: Record<string, any>
  responseData?: Record<string, any>

  severity: ErrorSeverity
  isRetryable: boolean
  retryCount: number

  resolved: boolean
  resolvedAt?: Date
  resolutionNotes?: string

  createdAt: Date
}

// ============================================================================
// PIPELINE TYPES
// ============================================================================

/**
 * Pipeline stage result
 */
export interface StageResult<T> {
  success: boolean
  data?: T
  error?: Error
  metadata?: Record<string, any>
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  job: IngestionJob
  config: SourceConfig
  dryRun: boolean
  verbose: boolean

  // State
  processedUrls: Set<string>
  errors: IngestionError[]

  // Callbacks
  onProgress?: (stage: string, current: number, total: number) => void
  onError?: (error: IngestionError) => void
  onComplete?: (job: IngestionJob) => void
}

/**
 * Pipeline configuration options
 */
export interface PipelineOptions {
  maxCases?: number
  throttleMs?: number // Delay between requests
  retryAttempts?: number
  retryDelayMs?: number
  confidenceThreshold?: number // Minimum confidence for auto-approval
  dryRun?: boolean
  verbose?: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extraction quality assessment
 */
export interface ExtractionQuality {
  quality: 'high' | 'medium' | 'low' | 'failed'
  score: number // 0-1
  errors: string[]
  warnings: string[]
  metadata: {
    textLength: number
    hasTitle: boolean
    hasDate: boolean
    hasCaseNumber: boolean
    hasParties: boolean
  }
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  requestsPerSecond: number
  burstSize?: number
  minDelayMs: number
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: string[]
}
