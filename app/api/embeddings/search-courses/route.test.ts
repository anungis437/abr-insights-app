/**
 * Integration Tests: Search Similar Courses by Text
 * 
 * Tests the /api/embeddings/search-courses endpoint for semantic similarity search
 * using vector embeddings.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the embedding service
vi.mock('@/lib/services/embedding-service', () => ({
  searchSimilarCoursesByText: vi.fn(),
}))

import { searchSimilarCoursesByText } from '@/lib/services/embedding-service'

describe('POST /api/embeddings/search-courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock requests
  const createMockRequest = (body: any): NextRequest => {
    return {
      json: async () => body,
    } as NextRequest
  }

  // Mock search results
  const mockSearchResults = [
    {
      course_id: 1,
      title: 'Introduction to Employment Law',
      description: 'Comprehensive overview of workplace rights',
      similarity_score: 0.92,
      difficulty: 'Beginner',
      category: 'Employment Law',
      duration_minutes: 60,
    },
    {
      course_id: 2,
      title: 'Advanced Discrimination Cases',
      description: 'Deep dive into complex discrimination scenarios',
      similarity_score: 0.85,
      difficulty: 'Advanced',
      category: 'Discrimination',
      duration_minutes: 120,
    },
  ]

  describe('Successful Searches', () => {
    it('should return courses with default parameters', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const request = createMockRequest({
        query: 'workplace discrimination',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        query: 'workplace discrimination',
        resultsCount: 2,
        results: mockSearchResults,
      })

      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('workplace discrimination', {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should return courses with custom similarity threshold', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([mockSearchResults[0]])

      const request = createMockRequest({
        query: 'employment rights',
        similarityThreshold: 0.9,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.resultsCount).toBe(1)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('employment rights', {
        similarityThreshold: 0.9,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should return courses with custom max results', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const request = createMockRequest({
        query: 'unfair dismissal',
        maxResults: 5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('unfair dismissal', {
        similarityThreshold: 0.7,
        maxResults: 5,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should filter by difficulty level', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([mockSearchResults[0]])

      const request = createMockRequest({
        query: 'employment basics',
        difficulty: 'Beginner',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('employment basics', {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: 'Beginner',
        category: undefined,
      })
    })

    it('should filter by category', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([mockSearchResults[1]])

      const request = createMockRequest({
        query: 'protected characteristics',
        category: 'Discrimination',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('protected characteristics', {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: undefined,
        category: 'Discrimination',
      })
    })

    it('should return empty results when no matches found', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([])

      const request = createMockRequest({
        query: 'extremely specific query',
        similarityThreshold: 0.99,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        query: 'extremely specific query',
        resultsCount: 0,
        results: [],
      })
    })
  })

  describe('Validation - Query Parameter', () => {
    it('should reject request with missing query', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Query text is required',
      })
      expect(searchSimilarCoursesByText).not.toHaveBeenCalled()
    })

    it('should reject request with null query', async () => {
      const request = createMockRequest({ query: null })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query text is required')
    })

    it('should reject request with empty string query', async () => {
      const request = createMockRequest({ query: '' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query text is required')
    })

    it('should reject request with whitespace-only query', async () => {
      const request = createMockRequest({ query: '   ' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query text is required')
    })

    it('should reject request with non-string query', async () => {
      const request = createMockRequest({ query: 12345 })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query text is required')
    })
  })

  describe('Validation - Similarity Threshold', () => {
    it('should reject similarity threshold below 0', async () => {
      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: -0.1,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Similarity threshold must be between 0 and 1')
    })

    it('should reject similarity threshold above 1', async () => {
      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 1.5,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Similarity threshold must be between 0 and 1')
    })

    it('should accept similarity threshold of 0', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 0,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('test query', {
        similarityThreshold: 0,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should accept similarity threshold of 1', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([])

      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 1,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('test query', {
        similarityThreshold: 1,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })
  })

  describe('Validation - Max Results', () => {
    it('should reject max results below 1', async () => {
      const request = createMockRequest({
        query: 'test query',
        maxResults: 0,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Max results must be between 1 and 100')
    })

    it('should reject max results above 100', async () => {
      const request = createMockRequest({
        query: 'test query',
        maxResults: 101,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Max results must be between 1 and 100')
    })

    it('should accept max results of 1', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([mockSearchResults[0]])

      const request = createMockRequest({
        query: 'test query',
        maxResults: 1,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('test query', {
        similarityThreshold: 0.7,
        maxResults: 1,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should accept max results of 100', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const request = createMockRequest({
        query: 'test query',
        maxResults: 100,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith('test query', {
        similarityThreshold: 0.7,
        maxResults: 100,
        difficulty: undefined,
        category: undefined,
      })
    })
  })

  describe('Service Errors', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(searchSimilarCoursesByText).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createMockRequest({
        query: 'test query',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to search similar courses',
        details: 'Database connection failed',
      })
    })

    it('should handle unknown errors', async () => {
      vi.mocked(searchSimilarCoursesByText).mockRejectedValue('Unknown error')

      const request = createMockRequest({
        query: 'test query',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to search similar courses',
        details: 'Unknown error',
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long queries', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const longQuery = 'discrimination '.repeat(100)
      const request = createMockRequest({ query: longQuery })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith(longQuery, {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should handle queries with special characters', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue([])

      const specialQuery = 'test @#$% query & more!'
      const request = createMockRequest({ query: specialQuery })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith(specialQuery, {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })

    it('should handle queries with newlines', async () => {
      vi.mocked(searchSimilarCoursesByText).mockResolvedValue(mockSearchResults)

      const multilineQuery = 'line one\nline two\nline three'
      const request = createMockRequest({ query: multilineQuery })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(searchSimilarCoursesByText).toHaveBeenCalledWith(multilineQuery, {
        similarityThreshold: 0.7,
        maxResults: 10,
        difficulty: undefined,
        category: undefined,
      })
    })
  })

  describe('Request Parsing', () => {
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
        error: 'Failed to search similar courses',
        details: 'Invalid JSON',
      })
    })

    it('should handle empty request body', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Query text is required')
    })
  })
})
