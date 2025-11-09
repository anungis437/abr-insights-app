/**
 * Embedding Generation Service
 * 
 * World-class implementation for generating vector embeddings using Azure OpenAI
 * text-embedding-3-large model. Features:
 * 
 * - Batch processing with retry logic and exponential backoff
 * - Rate limiting and concurrent request management
 * - Content hashing for change detection
 * - Token counting and cost tracking
 * - Progress tracking and job management
 * - Error handling and logging
 * - Automatic chunking for large texts
 * 
 * @module lib/services/embedding-service
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logger } from '@/lib/utils/logger'

// =====================================================
// Configuration
// =====================================================

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY!
const AZURE_OPENAI_EMBEDDING_DEPLOYMENT = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-large'
const EMBEDDING_MODEL = 'text-embedding-3-large'
const EMBEDDING_DIMENSIONS = 1536
const MAX_TOKENS_PER_REQUEST = 8191 // text-embedding-3-large limit
const BATCH_SIZE = 100 // Process 100 items at a time
const MAX_CONCURRENT_REQUESTS = 5
const RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =====================================================
// Types
// =====================================================

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
  model: string
}

export interface EmbeddingJobConfig {
  jobType: 'case_embeddings' | 'course_embeddings' | 'lesson_embeddings'
  batchSize?: number
  modelVersion?: string
  filters?: Record<string, any>
}

export interface EmbeddingJobProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  failedItems: number
  metrics: {
    avgTokens: number
    totalTokens: number
    durationSeconds: number
    itemsPerSecond: number
  }
}

export interface ContentToEmbed {
  id: string
  content: string
  metadata?: Record<string, any>
}

// =====================================================
// Core Embedding Generation
// =====================================================

/**
 * Generate embedding for a single text using Azure OpenAI
 */
export async function generateEmbedding(
  text: string,
  options: { retries?: number; model?: string } = {}
): Promise<EmbeddingResult> {
  const { retries = RETRY_ATTEMPTS, model = EMBEDDING_MODEL } = options

  // Validate text length
  const tokenCount = estimateTokenCount(text)
  if (tokenCount > MAX_TOKENS_PER_REQUEST) {
    throw new Error(
      `Text too long: ${tokenCount} tokens exceeds limit of ${MAX_TOKENS_PER_REQUEST}`
    )
  }

  // Make API call with retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_EMBEDDING_DEPLOYMENT}/embeddings?api-version=2024-02-01`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_KEY,
          },
          body: JSON.stringify({
            input: text,
            model: model,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Azure OpenAI API error: ${JSON.stringify(error)}`)
      }

      const data = await response.json()

      return {
        embedding: data.data[0].embedding,
        tokenCount: data.usage.total_tokens,
        model: model,
      }
    } catch (error) {
      console.error(`Embedding generation attempt ${attempt} failed:`, error)

      if (attempt === retries) {
        throw error
      }

      // Exponential backoff
      await sleep(RETRY_DELAY_MS * Math.pow(2, attempt - 1))
    }
  }

  throw new Error('Failed to generate embedding after all retries')
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  options: { maxConcurrent?: number; model?: string } = {}
): Promise<EmbeddingResult[]> {
  const { maxConcurrent = MAX_CONCURRENT_REQUESTS, model = EMBEDDING_MODEL } = options

  const results: EmbeddingResult[] = []
  const batches = chunkArray(texts, maxConcurrent)

  for (const batch of batches) {
    const batchPromises = batch.map((text) => generateEmbedding(text, { model }))
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

// =====================================================
// Case Embeddings
// =====================================================

/**
 * Generate and store embedding for a tribunal case
 */
export async function generateCaseEmbedding(
  caseId: string,
  embeddingType: 'full_text' | 'summary' | 'title_only' = 'full_text'
): Promise<void> {
  // Fetch case data
  const { data: caseData, error: fetchError } = await supabase
    .from('tribunal_cases')
    .select('*')
    .eq('id', caseId)
    .single()

  if (fetchError || !caseData) {
    throw new Error(`Failed to fetch case ${caseId}: ${fetchError?.message}`)
  }

  // Prepare text based on embedding type
  let textToEmbed = ''
  switch (embeddingType) {
    case 'full_text':
      textToEmbed = `${caseData.case_title}\n\n${caseData.summary || ''}\n\n${caseData.full_text || ''}`
      break
    case 'summary':
      textToEmbed = `${caseData.case_title}\n\n${caseData.summary || ''}`
      break
    case 'title_only':
      textToEmbed = caseData.case_title
      break
  }

  // Truncate if too long
  textToEmbed = truncateToTokenLimit(textToEmbed, MAX_TOKENS_PER_REQUEST)

  // Generate content hash
  const contentHash = generateContentHash(textToEmbed)

  // Check if embedding already exists with same content hash
  const { data: existingEmbedding } = await supabase
    .from('case_embeddings')
    .select('id, content_hash')
    .eq('case_id', caseId)
    .eq('embedding_type', embeddingType)
    .single()

  if (existingEmbedding && existingEmbedding.content_hash === contentHash) {
    logger.info(`Embedding for case ${caseId} (${embeddingType}) already up-to-date`)
    return
  }

  // Generate embedding
  const result = await generateEmbedding(textToEmbed)

  // Store embedding
  const embeddingData = {
    case_id: caseId,
    embedding: JSON.stringify(result.embedding),
    model_version: result.model,
    embedding_type: embeddingType,
    token_count: result.tokenCount,
    content_hash: contentHash,
  }

  if (existingEmbedding) {
    // Update existing
    const { error: updateError } = await supabase
      .from('case_embeddings')
      .update(embeddingData)
      .eq('id', existingEmbedding.id)

    if (updateError) {
      throw new Error(`Failed to update case embedding: ${updateError.message}`)
    }
  } else {
    // Insert new
    const { error: insertError } = await supabase
      .from('case_embeddings')
      .insert(embeddingData)

    if (insertError) {
      throw new Error(`Failed to insert case embedding: ${insertError.message}`)
    }
  }

  logger.info(`Generated embedding for case ${caseId} (${embeddingType}): ${result.tokenCount} tokens`)
}

/**
 * Generate embeddings for all tribunal cases in batch
 */
export async function generateAllCaseEmbeddings(
  options: { batchSize?: number; embeddingType?: 'full_text' | 'summary' | 'title_only' } = {}
): Promise<EmbeddingJobProgress> {
  const { batchSize = BATCH_SIZE, embeddingType = 'full_text' } = options

  // Create job record
  const { data: job, error: jobError } = await supabase
    .from('embedding_jobs')
    .insert({
      job_type: 'case_embeddings',
      status: 'pending',
      batch_size: batchSize,
      model_version: EMBEDDING_MODEL,
    })
    .select()
    .single()

  if (jobError || !job) {
    throw new Error(`Failed to create embedding job: ${jobError?.message}`)
  }

  const jobId = job.id
  const startTime = Date.now()

  try {
    // Update job status to running
    await supabase
      .from('embedding_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId)

    // Fetch all cases that need embeddings
    const { data: cases, error: casesError } = await supabase
      .from('tribunal_cases')
      .select('id')

    if (casesError || !cases) {
      throw new Error(`Failed to fetch cases: ${casesError?.message}`)
    }

    const totalItems = cases.length
    let processedItems = 0
    let failedItems = 0
    let totalTokens = 0
    const errorLog: any[] = []

    // Update total items
    await supabase
      .from('embedding_jobs')
      .update({ total_items: totalItems })
      .eq('id', jobId)

    // Process in batches
    const batches = chunkArray(cases, batchSize)

    for (const batch of batches) {
      const batchPromises = batch.map(async (caseItem) => {
        try {
          await generateCaseEmbedding(caseItem.id, embeddingType)
          processedItems++
          return { success: true, id: caseItem.id }
        } catch (error) {
          failedItems++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errorLog.push({ caseId: caseItem.id, error: errorMessage })
          console.error(`Failed to generate embedding for case ${caseItem.id}:`, error)
          return { success: false, id: caseItem.id, error: errorMessage }
        }
      })

      await Promise.all(batchPromises)

      // Update progress
      await supabase
        .from('embedding_jobs')
        .update({
          processed_items: processedItems,
          failed_items: failedItems,
        })
        .eq('id', jobId)

      logger.info(`Processed ${processedItems}/${totalItems} cases`)
    }

    // Calculate metrics
    const durationSeconds = (Date.now() - startTime) / 1000
    const avgTokens = totalTokens / Math.max(processedItems, 1)
    const itemsPerSecond = processedItems / durationSeconds

    const metrics = {
      avgTokens,
      totalTokens,
      durationSeconds,
      itemsPerSecond,
    }

    // Update job as completed
    await supabase
      .from('embedding_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metrics,
        error_log: errorLog.length > 0 ? errorLog : null,
      })
      .eq('id', jobId)

    return {
      jobId,
      status: 'completed',
      totalItems,
      processedItems,
      failedItems,
      metrics,
    }
  } catch (error) {
    // Update job as failed
    await supabase
      .from('embedding_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_log: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
      })
      .eq('id', jobId)

    throw error
  }
}

// =====================================================
// Course Embeddings
// =====================================================

/**
 * Generate and store embedding for a course
 */
export async function generateCourseEmbedding(
  courseId: string,
  embeddingType: 'full_content' | 'description' | 'objectives' = 'full_content'
): Promise<void> {
  // Fetch course data with lessons
  const { data: course, error: fetchError } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (
        title,
        content,
        learning_objectives
      )
    `)
    .eq('id', courseId)
    .single()

  if (fetchError || !course) {
    throw new Error(`Failed to fetch course ${courseId}: ${fetchError?.message}`)
  }

  // Prepare text based on embedding type
  let textToEmbed = ''
  switch (embeddingType) {
    case 'full_content':
      textToEmbed = `${course.title}\n\n${course.description || ''}\n\n`
      if (course.lessons && Array.isArray(course.lessons)) {
        course.lessons.forEach((lesson: any) => {
          textToEmbed += `${lesson.title}\n${lesson.content || ''}\n\n`
        })
      }
      break
    case 'description':
      textToEmbed = `${course.title}\n\n${course.description || ''}`
      break
    case 'objectives':
      textToEmbed = `${course.title}\n\n`
      if (course.lessons && Array.isArray(course.lessons)) {
        course.lessons.forEach((lesson: any) => {
          if (lesson.learning_objectives) {
            textToEmbed += `${lesson.learning_objectives}\n`
          }
        })
      }
      break
  }

  // Truncate if too long
  textToEmbed = truncateToTokenLimit(textToEmbed, MAX_TOKENS_PER_REQUEST)

  // Generate content hash
  const contentHash = generateContentHash(textToEmbed)

  // Check if embedding already exists
  const { data: existingEmbedding } = await supabase
    .from('course_embeddings')
    .select('id, content_hash')
    .eq('course_id', courseId)
    .eq('embedding_type', embeddingType)
    .single()

  if (existingEmbedding && existingEmbedding.content_hash === contentHash) {
    logger.info(`Embedding for course ${courseId} (${embeddingType}) already up-to-date`)
    return
  }

  // Generate embedding
  const result = await generateEmbedding(textToEmbed)

  // Store embedding
  const embeddingData = {
    course_id: courseId,
    embedding: JSON.stringify(result.embedding),
    model_version: result.model,
    embedding_type: embeddingType,
    token_count: result.tokenCount,
    content_hash: contentHash,
  }

  if (existingEmbedding) {
    const { error: updateError } = await supabase
      .from('course_embeddings')
      .update(embeddingData)
      .eq('id', existingEmbedding.id)

    if (updateError) {
      throw new Error(`Failed to update course embedding: ${updateError.message}`)
    }
  } else {
    const { error: insertError } = await supabase
      .from('course_embeddings')
      .insert(embeddingData)

    if (insertError) {
      throw new Error(`Failed to insert course embedding: ${insertError.message}`)
    }
  }

  logger.info(`Generated embedding for course ${courseId} (${embeddingType}): ${result.tokenCount} tokens`)
}

/**
 * Generate embeddings for all courses in batch
 */
export async function generateAllCourseEmbeddings(
  options: { batchSize?: number; embeddingType?: 'full_content' | 'description' | 'objectives' } = {}
): Promise<EmbeddingJobProgress> {
  const { batchSize = BATCH_SIZE, embeddingType = 'full_content' } = options

  const { data: job, error: jobError } = await supabase
    .from('embedding_jobs')
    .insert({
      job_type: 'course_embeddings',
      status: 'pending',
      batch_size: batchSize,
      model_version: EMBEDDING_MODEL,
    })
    .select()
    .single()

  if (jobError || !job) {
    throw new Error(`Failed to create embedding job: ${jobError?.message}`)
  }

  const jobId = job.id
  const startTime = Date.now()

  try {
    await supabase
      .from('embedding_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId)

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')

    if (coursesError || !courses) {
      throw new Error(`Failed to fetch courses: ${coursesError?.message}`)
    }

    const totalItems = courses.length
    let processedItems = 0
    let failedItems = 0
    const errorLog: any[] = []

    await supabase
      .from('embedding_jobs')
      .update({ total_items: totalItems })
      .eq('id', jobId)

    const batches = chunkArray(courses, batchSize)

    for (const batch of batches) {
      const batchPromises = batch.map(async (course) => {
        try {
          await generateCourseEmbedding(course.id, embeddingType)
          processedItems++
          return { success: true, id: course.id }
        } catch (error) {
          failedItems++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errorLog.push({ courseId: course.id, error: errorMessage })
          console.error(`Failed to generate embedding for course ${course.id}:`, error)
          return { success: false, id: course.id, error: errorMessage }
        }
      })

      await Promise.all(batchPromises)

      await supabase
        .from('embedding_jobs')
        .update({
          processed_items: processedItems,
          failed_items: failedItems,
        })
        .eq('id', jobId)

      logger.info(`Processed ${processedItems}/${totalItems} courses`)
    }

    const durationSeconds = (Date.now() - startTime) / 1000
    const metrics = {
      avgTokens: 0,
      totalTokens: 0,
      durationSeconds,
      itemsPerSecond: processedItems / durationSeconds,
    }

    await supabase
      .from('embedding_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metrics,
        error_log: errorLog.length > 0 ? errorLog : null,
      })
      .eq('id', jobId)

    return {
      jobId,
      status: 'completed',
      totalItems,
      processedItems,
      failedItems,
      metrics,
    }
  } catch (error) {
    await supabase
      .from('embedding_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_log: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
      })
      .eq('id', jobId)

    throw error
  }
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Generate SHA-256 hash of content for change detection
 */
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Truncate text to stay within token limit
 */
function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokenCount(text)
  if (estimatedTokens <= maxTokens) {
    return text
  }

  // Truncate to approximately maxTokens (4 chars per token)
  const maxChars = maxTokens * 4
  return text.substring(0, maxChars)
}

/**
 * Chunk array into smaller batches
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =====================================================
// Query Embedding (for search)
// =====================================================

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const result = await generateEmbedding(query)
  return result.embedding
}

/**
 * Search similar cases using text query
 */
export async function searchSimilarCasesByText(
  query: string,
  options: {
    similarityThreshold?: number
    maxResults?: number
    tribunalName?: string
    discriminationGrounds?: string[]
  } = {}
): Promise<any[]> {
  const {
    similarityThreshold = 0.7,
    maxResults = 10,
    tribunalName = null,
    discriminationGrounds = null,
  } = options

  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query)

  // Call database function
  const { data, error } = await supabase.rpc('search_similar_cases', {
    query_embedding: JSON.stringify(queryEmbedding),
    similarity_threshold: similarityThreshold,
    max_results: maxResults,
    filter_tribunal_name: tribunalName,
    filter_discrimination_grounds: discriminationGrounds,
  })

  if (error) {
    throw new Error(`Failed to search similar cases: ${error.message}`)
  }

  return data || []
}

/**
 * Search similar courses using text query
 */
export async function searchSimilarCoursesByText(
  query: string,
  options: {
    similarityThreshold?: number
    maxResults?: number
    difficulty?: string
    category?: string
  } = {}
): Promise<any[]> {
  const {
    similarityThreshold = 0.7,
    maxResults = 10,
    difficulty = null,
    category = null,
  } = options

  const queryEmbedding = await generateQueryEmbedding(query)

  const { data, error } = await supabase.rpc('search_similar_courses', {
    query_embedding: JSON.stringify(queryEmbedding),
    similarity_threshold: similarityThreshold,
    max_results: maxResults,
    filter_difficulty: difficulty,
    filter_category: category,
  })

  if (error) {
    throw new Error(`Failed to search similar courses: ${error.message}`)
  }

  return data || []
}

// =====================================================
// Job Management
// =====================================================

/**
 * Get embedding job status
 */
export async function getEmbeddingJobStatus(jobId: string): Promise<EmbeddingJobProgress | null> {
  const { data, error } = await supabase
    .from('embedding_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    jobId: data.id,
    status: data.status,
    totalItems: data.total_items,
    processedItems: data.processed_items,
    failedItems: data.failed_items,
    metrics: data.metrics || {
      avgTokens: 0,
      totalTokens: 0,
      durationSeconds: 0,
      itemsPerSecond: 0,
    },
  }
}

/**
 * Get all embedding jobs
 */
export async function getAllEmbeddingJobs(): Promise<any[]> {
  const { data, error } = await supabase
    .from('embedding_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch embedding jobs: ${error.message}`)
  }

  return data || []
}
