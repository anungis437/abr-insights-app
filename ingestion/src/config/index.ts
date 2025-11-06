/**
 * Ingestion Pipeline Configuration
 * 
 * Centralized configuration for scraping, classification, and storage.
 * Environment-aware with sensible defaults.
 */

import type { RateLimiterConfig, RetryConfig } from '../types';

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Azure OpenAI
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
  AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  
  // Pipeline
  PIPELINE_VERSION: process.env.npm_package_version || '1.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// ============================================================================
// SCRAPER CONFIGURATION
// ============================================================================

export const SCRAPER_CONFIG = {
  // User agent for HTTP requests
  userAgent: 'ABR-Insights-Bot/1.0 (Educational Research; +https://abr-insights.ca)',
  
  // Request timeouts
  requestTimeoutMs: 30000, // 30 seconds
  
  // Rate limiting (respectful scraping)
  rateLimiter: {
    requestsPerSecond: 0.5, // 1 request every 2 seconds
    burstSize: 3,
    minDelayMs: 2000, // Minimum 2 seconds between requests
  } as RateLimiterConfig,
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    initialDelayMs: 5000, // 5 seconds
    maxDelayMs: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryableErrors: [
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EHOSTUNREACH',
    ],
  } as RetryConfig,
  
  // Content extraction
  maxTextLength: 500000, // 500KB max per case
  minTextLength: 500, // Minimum valid case length
  
} as const;

// ============================================================================
// SOURCE CONFIGURATIONS
// ============================================================================

export const SOURCE_CONFIGS = {
  canlii_hrto: {
    sourceSystem: 'canlii_hrto' as const,
    baseUrl: 'https://www.canlii.org',
    listingUrl: 'https://www.canlii.org/en/on/onhrt/',
    selectors: {
      listingResults: '.result-title a',
      resultDate: '.date',
      resultPreview: '.summary',
      contentContainer: '.documentcontent',
      caseNumber: '.citation',
      tribunal: '.tribunal-name',
      decisionDate: '.decision-date',
      parties: '.parties',
    },
    pagination: {
      enabled: true,
      paramName: 'page',
      maxPages: 10,
    },
  },
  
  canlii_chrt: {
    sourceSystem: 'canlii_chrt' as const,
    baseUrl: 'https://www.canlii.org',
    listingUrl: 'https://www.canlii.org/en/ca/chrt/',
    selectors: {
      listingResults: '.result-title a',
      resultDate: '.date',
      resultPreview: '.summary',
      contentContainer: '.documentcontent',
      caseNumber: '.citation',
      tribunal: '.tribunal-name',
      decisionDate: '.decision-date',
      parties: '.parties',
    },
    pagination: {
      enabled: true,
      paramName: 'page',
      maxPages: 10,
    },
  },
} as const;

// ============================================================================
// CLASSIFIER CONFIGURATION
// ============================================================================

export const CLASSIFIER_CONFIG = {
  // Rule-based classifier keywords
  keywords: {
    race: [
      'race',
      'racial',
      'racism',
      'racist',
      'racialized',
      'colour',
      'color',
      'ancestry',
      'ethnic origin',
      'ethnicity',
      'place of origin',
    ],
    
    black: [
      'black',
      'anti-black',
      'african',
      'caribbean',
      'afro-canadian',
      'afro-caribbean',
      'african canadian',
      'african-canadian',
      'negro', // Historical legal term
    ],
    
    discrimination: [
      'discrimination',
      'discriminatory',
      'discriminate',
      'discriminated',
      'profiling',
      'harassment',
      'harassed',
      'prejudice',
      'bias',
      'stereotyping',
      'microaggression',
    ],
  },
  
  // Confidence thresholds
  confidence: {
    highThreshold: 0.8, // Auto-approve if above
    mediumThreshold: 0.5, // Manual review required
    lowThreshold: 0.3, // Likely reject
  },
  
  // Weights for combined score
  weights: {
    ruleBased: 0.3,
    aiClassifier: 0.7,
  },
  
  // AI classifier settings
  ai: {
    model: ENV.AZURE_OPENAI_DEPLOYMENT,
    temperature: 0.1, // Low temperature for consistent classification
    maxTokens: 1000,
    systemPrompt: `You are an expert legal analyst specializing in Canadian human rights law, particularly anti-Black racism cases.

Your task is to analyze tribunal decisions and determine:
1. Whether the case involves discrimination based on race/colour/ancestry
2. Whether it specifically involves anti-Black racism
3. Key discrimination grounds, issues, and remedies

Respond with structured JSON only.`,
  },
} as const;

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

export const STORAGE_CONFIG = {
  // Batch sizes
  batchSize: 10, // Insert cases in batches
  
  // Quality gates
  minConfidenceForAutoApproval: 0.85,
  
  // Deduplication
  deduplicationFields: ['sourceUrl', 'caseNumber'],
  
  // Promotion workflow
  requireManualReview: true, // Require human review before promotion
  
} as const;

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

export const PIPELINE_CONFIG = {
  // Default limits
  defaultMaxCases: 50, // Max cases per job (safety limit)
  
  // Checkpointing
  checkpointInterval: 10, // Save progress every N cases
  
  // Monitoring
  progressReportInterval: 5, // Report progress every N cases
  
  // Error handling
  maxErrorsBeforeAbort: 20, // Abort job if too many errors
  maxConsecutiveErrors: 5, // Abort if N errors in a row
  
  // Execution
  enableCheckpointing: true,
  enableErrorRecovery: true,
  
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates that required environment variables are set
 * @throws Error if critical env vars are missing
 */
export function validateEnvironment(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !ENV[key as keyof typeof ENV]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
  
  // Warn about optional but recommended
  const recommended = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
  ];
  
  const missingRecommended = recommended.filter(
    key => !ENV[key as keyof typeof ENV]
  );
  
  if (missingRecommended.length > 0) {
    console.warn(
      `⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}\n` +
      'AI classification will be disabled.'
    );
  }
}

/**
 * Returns configuration for a specific source system
 */
export function getSourceConfig(sourceSystem: keyof typeof SOURCE_CONFIGS) {
  const config = SOURCE_CONFIGS[sourceSystem];
  if (!config) {
    throw new Error(`Unknown source system: ${sourceSystem}`);
  }
  return config;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const CONFIG = {
  env: ENV,
  scraper: SCRAPER_CONFIG,
  sources: SOURCE_CONFIGS,
  classifier: CLASSIFIER_CONFIG,
  storage: STORAGE_CONFIG,
  pipeline: PIPELINE_CONFIG,
} as const;

export default CONFIG;
