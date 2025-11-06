/**
 * Supabase Storage Service
 * Persists classified tribunal cases to Supabase database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DecisionContent, CombinedClassification, SourceSystem } from '../types/index.js';

// Database Types
export interface TribunalCaseRaw {
  id?: string;
  
  // Source Information
  source_url: string;
  source_system: string;
  source_id?: string | null;
  
  // Case Identification
  case_number?: string | null;
  case_title: string;
  citation?: string | null;
  
  // Tribunal Info
  tribunal_name: string;
  tribunal_province?: string | null;
  decision_date?: string | null;
  filing_date?: string | null;
  
  // Parties
  applicant?: string | null;
  respondent?: string | null;
  
  // Content
  html_content?: string | null;
  full_text: string;
  text_length: number;
  
  // Document Metadata
  document_type?: string | null;
  language: 'en' | 'fr' | 'unknown';
  pdf_url?: string | null;
  
  // Classification Results
  rule_based_classification: object;
  ai_classification: object;
  combined_confidence: number;
  
  // Detected Attributes
  discrimination_grounds: string[];
  key_issues: string[];
  remedies: string[];
  
  // Quality Flags
  extraction_quality: 'high' | 'medium' | 'low' | 'failed';
  extraction_errors: string[];
  needs_review: boolean;
  review_notes?: string | null;
  
  // Promotion Status
  promotion_status: 'pending' | 'approved' | 'rejected' | 'promoted' | 'duplicate';
  promoted_case_id?: string | null;
  promoted_at?: string | null;
  promoted_by?: string | null;
  
  // Ingestion Job Reference
  ingestion_job_id?: string | null;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string | null;
}

export interface IngestionJob {
  id?: string;
  
  // Job Configuration
  job_type: 'manual' | 'scheduled' | 'retry' | 'backfill';
  source_system: string;
  source_config: object;
  
  // Execution
  status: 'pending' | 'running' | 'completed' | 'partial' | 'failed' | 'cancelled';
  started_at?: string | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  
  // Metrics
  cases_discovered: number;
  cases_fetched: number;
  cases_classified: number;
  cases_stored: number;
  cases_failed: number;
  
  // Quality Metrics
  avg_confidence_score?: number | null;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  
  // Error Tracking
  error_message?: string | null;
  error_details: object;
  
  // Execution Context
  triggered_by?: string | null;
  execution_environment: string;
  pipeline_version: string;
  
  // Resume Capability
  last_processed_url?: string | null;
  checkpoint_data: object;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface StorageStats {
  totalStored: number;
  antiBlackCount: number;
  otherCount: number;
  avgConfidence: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
}

export class SupabaseStorageService {
  private client: SupabaseClient;
  private currentJobId: string | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Create a new ingestion job
   */
  async createJob(
    sourceSystem: SourceSystem,
    jobType: 'manual' | 'scheduled' | 'retry' | 'backfill' = 'manual',
    sourceConfig: object = {}
  ): Promise<string> {
    const jobData: Partial<IngestionJob> = {
      job_type: jobType,
      source_system: sourceSystem,
      source_config: sourceConfig,
      status: 'running',
      started_at: new Date().toISOString(),
      execution_environment: 'local',
      pipeline_version: process.env.npm_package_version || '1.0.0',
      cases_discovered: 0,
      cases_fetched: 0,
      cases_classified: 0,
      cases_stored: 0,
      cases_failed: 0,
      high_confidence_count: 0,
      medium_confidence_count: 0,
      low_confidence_count: 0,
      error_details: {},
      checkpoint_data: {},
    };

    const { data, error } = await this.client
      .from('ingestion_jobs')
      .insert(jobData)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create ingestion job: ${error.message}`);
    }

    this.currentJobId = data.id;
    return data.id;
  }

  /**
   * Update ingestion job metrics
   */
  async updateJobMetrics(
    jobId: string,
    metrics: {
      cases_discovered?: number;
      cases_fetched?: number;
      cases_classified?: number;
      cases_stored?: number;
      cases_failed?: number;
      high_confidence_count?: number;
      medium_confidence_count?: number;
      low_confidence_count?: number;
      avg_confidence_score?: number;
      last_processed_url?: string;
    }
  ): Promise<void> {
    const { error } = await this.client
      .from('ingestion_jobs')
      .update(metrics)
      .eq('id', jobId);

    if (error) {
      console.error('Failed to update job metrics:', error);
    }
  }

  /**
   * Complete an ingestion job
   */
  async completeJob(
    jobId: string,
    status: 'completed' | 'partial' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    const startedAt = await this.getJobStartTime(jobId);
    const durationSeconds = startedAt
      ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      : null;

    const updates: Partial<IngestionJob> = {
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await this.client
      .from('ingestion_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) {
      console.error('Failed to complete job:', error);
    }
  }

  /**
   * Get job start time
   */
  private async getJobStartTime(jobId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from('ingestion_jobs')
      .select('started_at')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.started_at;
  }

  /**
   * Store a single classified case
   */
  async storeCase(
    content: DecisionContent,
    classification: CombinedClassification,
    sourceSystem: SourceSystem,
    sourceUrl: string
  ): Promise<string> {
    // Determine confidence level
    const confidence = classification.finalConfidence;
    let confidenceBucket: 'high' | 'medium' | 'low' = 'low';
    if (confidence >= 0.8) confidenceBucket = 'high';
    else if (confidence >= 0.5) confidenceBucket = 'medium';

    // Prepare case data
    const caseData: Partial<TribunalCaseRaw> = {
      // Source
      source_url: sourceUrl,
      source_system: sourceSystem,
      source_id: content.id,
      
      // Case Identification
      case_number: content.citation || null,
      case_title: content.title,
      citation: content.citation || null,
      
      // Tribunal Info
      tribunal_name: content.tribunal || 'Unknown Tribunal',
      tribunal_province: this.extractProvince(sourceSystem),
      decision_date: content.date || null,
      filing_date: null,
      
      // Parties
      applicant: content.applicant || null,
      respondent: content.respondent || null,
      
      // Content
      html_content: null, // Not storing HTML for demo
      full_text: content.fullText,
      text_length: content.fullText.length,
      
      // Document Metadata
      document_type: content.documentType || 'decision',
      language: content.language || 'en',
      pdf_url: null,
      
      // Classification Results
      rule_based_classification: {
        category: classification.ruleBasedResult.isAntiBlackLikely ? 'anti_black_racism' : 'other',
        keywords: classification.ruleBasedResult.keywordMatches,
        grounds: classification.ruleBasedResult.groundsDetected,
        confidence: classification.ruleBasedResult.confidence,
      },
      ai_classification: classification.aiResult ? {
        category: classification.aiResult.category,
        reasoning: classification.aiResult.reasoning,
        confidence: classification.aiResult.confidence,
        keyPhrases: classification.aiResult.keyPhrases,
      } : undefined,
      combined_confidence: confidence,
      
      // Detected Attributes
      discrimination_grounds: classification.aiResult?.groundsDetected || [],
      key_issues: classification.aiResult?.keyIssues || [],
      remedies: classification.aiResult?.remedies || this.extractRemedies(content.fullText),
      
      // Quality Flags
      extraction_quality: content.fullText.length > 5000 ? 'high' : content.fullText.length > 2000 ? 'medium' : 'low',
      extraction_errors: [],
      needs_review: confidence < 0.7,
      
      // Promotion Status
      promotion_status: confidence >= 0.8 ? 'approved' : 'pending',
      
      // Ingestion Job Reference
      ingestion_job_id: this.currentJobId,
    };

    // Check for duplicates
    const { data: existingCase } = await this.client
      .from('tribunal_cases_raw')
      .select('id')
      .eq('source_url', sourceUrl)
      .single();

    if (existingCase) {
      console.log(`Case already exists: ${sourceUrl}`);
      return existingCase.id;
    }

    // Insert case
    const { data, error } = await this.client
      .from('tribunal_cases_raw')
      .insert(caseData)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to store case: ${error.message}`);
    }

    // Update job metrics
    if (this.currentJobId) {
      const metricField = confidenceBucket === 'high' ? 'high_confidence_count'
        : confidenceBucket === 'medium' ? 'medium_confidence_count'
        : 'low_confidence_count';

      try {
        await this.client.rpc('increment_job_counter', {
          job_id: this.currentJobId,
          field_name: metricField,
        });
      } catch {
        // Fallback if RPC doesn't exist - manual increment
        await this.updateJobMetrics(this.currentJobId, {
          cases_stored: 1, // Will need to track total separately
        });
      }
    }

    return data.id;
  }

  /**
   * Store multiple cases in batch
   */
  async storeCasesBatch(
    cases: Array<{
      content: DecisionContent;
      classification: CombinedClassification;
      sourceSystem: SourceSystem;
      sourceUrl: string;
    }>
  ): Promise<string[]> {
    const caseIds: string[] = [];

    for (const caseItem of cases) {
      try {
        const id = await this.storeCase(
          caseItem.content,
          caseItem.classification,
          caseItem.sourceSystem,
          caseItem.sourceUrl
        );
        caseIds.push(id);
      } catch (error) {
        console.error(`Failed to store case ${caseItem.sourceUrl}:`, error);
        
        // Log error to ingestion_errors table
        if (this.currentJobId) {
          await this.logError(
            this.currentJobId,
            'storage',
            error instanceof Error ? error.message : 'Unknown error',
            caseItem.sourceUrl
          );
        }
      }
    }

    return caseIds;
  }

  /**
   * Log an ingestion error
   */
  async logError(
    jobId: string,
    stage: 'discovery' | 'fetch' | 'extraction' | 'classification' | 'storage',
    errorMessage: string,
    sourceUrl?: string,
    severity: 'warning' | 'error' | 'critical' = 'error'
  ): Promise<void> {
    const errorData = {
      ingestion_job_id: jobId,
      error_stage: stage,
      error_type: 'general_error',
      error_message: errorMessage,
      source_url: sourceUrl || null,
      severity,
      is_retryable: true,
      retry_count: 0,
      resolved: false,
    };

    const { error: insertError } = await this.client
      .from('ingestion_errors')
      .insert(errorData);
    
    if (insertError) {
      console.error('Failed to log error:', insertError);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    const { data, error } = await this.client
      .from('tribunal_cases_raw')
      .select('ai_classification, combined_confidence');

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const stats: StorageStats = {
      totalStored: data.length,
      antiBlackCount: 0,
      otherCount: 0,
      avgConfidence: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
    };

    let totalConfidence = 0;

    for (const row of data) {
      const aiClassification = row.ai_classification as any;
      const confidence = row.combined_confidence;

      if (aiClassification?.category === 'anti_black_racism') {
        stats.antiBlackCount++;
      } else {
        stats.otherCount++;
      }

      totalConfidence += confidence || 0;

      if (confidence >= 0.8) stats.highConfidenceCount++;
      else if (confidence >= 0.5) stats.mediumConfidenceCount++;
      else stats.lowConfidenceCount++;
    }

    stats.avgConfidence = data.length > 0 ? totalConfidence / data.length : 0;

    return stats;
  }

  /**
   * Get cases for review (low confidence or needs manual review)
   */
  async getCasesForReview(limit: number = 50): Promise<TribunalCaseRaw[]> {
    const { data, error } = await this.client
      .from('tribunal_cases_raw')
      .select('*')
      .eq('needs_review', true)
      .eq('promotion_status', 'pending')
      .order('combined_confidence', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch cases for review: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Helper: Extract province from source system
   */
  private extractProvince(sourceSystem: SourceSystem): string | null {
    const provinceMap: Record<string, string> = {
      hrto: 'ON',
      chrt: 'Federal',
      bchrt: 'BC',
      qctdp: 'QC',
      abqb: 'AB',
      skqb: 'SK',
      mbqb: 'MB',
      nssc: 'NS',
      nbqb: 'NB',
    };

    for (const [key, province] of Object.entries(provinceMap)) {
      if (sourceSystem.includes(key)) {
        return province;
      }
    }

    return null;
  }

  /**
   * Helper: Extract remedies from decision text
   */
  private extractRemedies(fullText: string): string[] {
    const remedies: string[] = [];
    const lowerText = fullText.toLowerCase();

    // Common remedy patterns
    const remedyPatterns = [
      { pattern: /\$[\d,]+/g, type: 'monetary' },
      { pattern: /\b(training|education|awareness)\b/i, type: 'training' },
      { pattern: /\b(policy|policies|procedure)\b/i, type: 'policy_change' },
      { pattern: /\b(reinstat(e|ement))\b/i, type: 'reinstatement' },
      { pattern: /\b(apolog(y|ize))\b/i, type: 'apology' },
      { pattern: /\b(reference|letter)\b/i, type: 'reference_letter' },
    ];

    for (const { pattern, type } of remedyPatterns) {
      if (pattern.test(lowerText)) {
        remedies.push(type);
      }
    }

    return [...new Set(remedies)]; // Unique remedies only
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    // Supabase client doesn't require explicit closing in Node.js
    // But we can clear the current job ID
    this.currentJobId = null;
  }
}
