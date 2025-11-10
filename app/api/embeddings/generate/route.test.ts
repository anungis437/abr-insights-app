/**
 * Integration Tests: Generate Embeddings
 * 
 * Tests the /api/embeddings/generate endpoint for batch embedding generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'

// Mock the embedding service
vi.mock('@/lib/services/embedding-service', () => ({
  generateAllCaseEmbeddings: vi.fn(),
  generateAllCourseEmbeddings: vi.fn(),
  getEmbeddingJobStatus: vi.fn(),
}))

import {
  generateAllCaseEmbeddings,
  generateAllCourseEmbeddings,
  getEmbeddingJobStatus,
} from '@/lib/services/embedding-service'

describe('POST /api/embeddings/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock requests
  const createMockRequest = (body: any): NextRequest => {
    return {
      json: async () => body,
    } as NextRequest
  }

  // Mock job progress
  const mockJobProgress = {
    jobId: 'job-123',
    status: 'in_progress',
    total: 100,
    processed: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
  }

  describe('Type Validation', () => {
    it('should reject request with missing type', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Type must be either "cases" or "courses"')
      expect(generateAllCaseEmbeddings).not.toHaveBeenCalled()
      expect(generateAllCourseEmbeddings).not.toHaveBeenCalled()
    })

    it('should reject request with null type', async () => {
      const request = createMockRequest({ type: null })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Type must be either "cases" or "courses"')
    })

    it('should reject request with invalid type', async () => {
      const request = createMockRequest({ type: 'invalid' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Type must be either "cases" or "courses"')
    })

    it('should accept type "cases"', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({ type: 'cases' })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCaseEmbeddings).toHaveBeenCalled()
    })

    it('should accept type "courses"', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({ type: 'courses' })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCourseEmbeddings).toHaveBeenCalled()
    })
  })

  describe('Case Embeddings', () => {
    it('should generate case embeddings with default type', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'cases',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Successfully generated embeddings for cases',
        job: mockJobProgress,
      })

      expect(generateAllCaseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'full_text',
      })
    })

    it('should generate case embeddings with full_text type', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'cases',
        embeddingType: 'full_text',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCaseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'full_text',
      })
    })

    it('should generate case embeddings with summary type', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'cases',
        embeddingType: 'summary',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCaseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'summary',
      })
    })

    it('should generate case embeddings with title_only type', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'cases',
        embeddingType: 'title_only',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCaseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'title_only',
      })
    })

    it('should reject invalid case embedding type', async () => {
      const request = createMockRequest({
        type: 'cases',
        embeddingType: 'invalid',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Embedding type must be one of: full_text, summary, title_only')
      expect(generateAllCaseEmbeddings).not.toHaveBeenCalled()
    })

    it('should use custom batch size for cases', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'cases',
        batchSize: 50,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCaseEmbeddings).toHaveBeenCalledWith({
        batchSize: 50,
        embeddingType: 'full_text',
      })
    })
  })

  describe('Course Embeddings', () => {
    it('should generate course embeddings with default type', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'courses',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Successfully generated embeddings for courses',
        job: mockJobProgress,
      })

      expect(generateAllCourseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'full_content',
      })
    })

    it('should generate course embeddings with full_content type', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'courses',
        embeddingType: 'full_content',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCourseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'full_content',
      })
    })

    it('should generate course embeddings with description type', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'courses',
        embeddingType: 'description',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCourseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'description',
      })
    })

    it('should generate course embeddings with objectives type', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'courses',
        embeddingType: 'objectives',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCourseEmbeddings).toHaveBeenCalledWith({
        batchSize: 100,
        embeddingType: 'objectives',
      })
    })

    it('should reject invalid course embedding type', async () => {
      const request = createMockRequest({
        type: 'courses',
        embeddingType: 'invalid',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Embedding type must be one of: full_content, description, objectives')
      expect(generateAllCourseEmbeddings).not.toHaveBeenCalled()
    })

    it('should use custom batch size for courses', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockResolvedValue(mockJobProgress)

      const request = createMockRequest({
        type: 'courses',
        batchSize: 25,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(generateAllCourseEmbeddings).toHaveBeenCalledWith({
        batchSize: 25,
        embeddingType: 'full_content',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle case embedding generation errors', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createMockRequest({ type: 'cases' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate embeddings',
        details: 'Database connection failed',
      })
    })

    it('should handle course embedding generation errors', async () => {
      vi.mocked(generateAllCourseEmbeddings).mockRejectedValue(
        new Error('OpenAI API error')
      )

      const request = createMockRequest({ type: 'courses' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate embeddings',
        details: 'OpenAI API error',
      })
    })

    it('should handle unknown errors', async () => {
      vi.mocked(generateAllCaseEmbeddings).mockRejectedValue('Unknown error')

      const request = createMockRequest({ type: 'cases' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate embeddings',
        details: 'Unknown error',
      })
    })

    it('should handle malformed JSON', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate embeddings',
        details: 'Invalid JSON',
      })
    })
  })
})

describe('GET /api/embeddings/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock GET requests
  const createMockGetRequest = (jobId?: string): NextRequest => {
    const url = jobId
      ? `http://localhost:3000/api/embeddings/generate?jobId=${jobId}`
      : 'http://localhost:3000/api/embeddings/generate'

    return {
      url,
    } as NextRequest
  }

  // Mock job status
  const mockJobStatus = {
    jobId: 'job-123',
    status: 'completed',
    total: 100,
    processed: 100,
    failed: 0,
    startedAt: new Date('2024-01-01').toISOString(),
    completedAt: new Date('2024-01-01').toISOString(),
  }

  describe('Job Status Retrieval', () => {
    it('should return job status for valid job ID', async () => {
      vi.mocked(getEmbeddingJobStatus).mockResolvedValue(mockJobStatus)

      const request = createMockGetRequest('job-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        job: mockJobStatus,
      })

      expect(getEmbeddingJobStatus).toHaveBeenCalledWith('job-123')
    })

    it('should return in-progress job status', async () => {
      const inProgressStatus = {
        ...mockJobStatus,
        status: 'in_progress',
        processed: 50,
        completedAt: null,
      }

      vi.mocked(getEmbeddingJobStatus).mockResolvedValue(inProgressStatus)

      const request = createMockGetRequest('job-456')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.job.status).toBe('in_progress')
      expect(data.job.processed).toBe(50)
    })

    it('should return failed job status', async () => {
      const failedStatus = {
        ...mockJobStatus,
        status: 'failed',
        processed: 25,
        failed: 75,
        error: 'Batch processing error',
      }

      vi.mocked(getEmbeddingJobStatus).mockResolvedValue(failedStatus)

      const request = createMockGetRequest('job-789')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.job.status).toBe('failed')
      expect(data.job.failed).toBe(75)
    })
  })

  describe('Validation', () => {
    it('should reject request with missing job ID', async () => {
      const request = createMockGetRequest()

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Job ID is required')
      expect(getEmbeddingJobStatus).not.toHaveBeenCalled()
    })

    it('should return 404 for non-existent job', async () => {
      vi.mocked(getEmbeddingJobStatus).mockResolvedValue(null)

      const request = createMockGetRequest('non-existent-job')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Job not found')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(getEmbeddingJobStatus).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createMockGetRequest('job-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to get job status',
        details: 'Database connection failed',
      })
    })

    it('should handle unknown errors', async () => {
      vi.mocked(getEmbeddingJobStatus).mockRejectedValue('Unknown error')

      const request = createMockGetRequest('job-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to get job status',
        details: 'Unknown error',
      })
    })
  })
})
