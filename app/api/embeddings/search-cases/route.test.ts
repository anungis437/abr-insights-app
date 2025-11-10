import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as embeddingService from '@/lib/services/embedding-service';

// Mock the embedding service
vi.mock('@/lib/services/embedding-service', () => ({
  searchSimilarCasesByText: vi.fn(),
}));

describe('POST /api/embeddings/search-cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any): NextRequest => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  const mockSearchResults = [
    {
      id: '1',
      title: 'Test Case 1',
      similarity: 0.95,
      decision_date: '2024-01-01',
      tribunal_name: 'HRTO',
    },
    {
      id: '2',
      title: 'Test Case 2',
      similarity: 0.85,
      decision_date: '2024-01-15',
      tribunal_name: 'HRTO',
    },
  ];

  describe('Successful Searches', () => {
    it('should search similar cases with default parameters', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'discrimination case',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.query).toBe('discrimination case');
      expect(json.resultsCount).toBe(2);
      expect(json.results).toEqual(mockSearchResults);

      expect(embeddingService.searchSimilarCasesByText).toHaveBeenCalledWith('discrimination case', {
        similarityThreshold: 0.7,
        maxResults: 10,
        tribunalName: undefined,
        discriminationGrounds: undefined,
      });
    });

    it('should search with custom similarity threshold', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([mockSearchResults[0]]);

      const request = createMockRequest({
        query: 'disability rights',
        similarityThreshold: 0.9,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.resultsCount).toBe(1);

      expect(embeddingService.searchSimilarCasesByText).toHaveBeenCalledWith('disability rights', {
        similarityThreshold: 0.9,
        maxResults: 10,
        tribunalName: undefined,
        discriminationGrounds: undefined,
      });
    });

    it('should search with custom max results', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'employment case',
        maxResults: 5,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);

      expect(embeddingService.searchSimilarCasesByText).toHaveBeenCalledWith('employment case', {
        similarityThreshold: 0.7,
        maxResults: 5,
        tribunalName: undefined,
        discriminationGrounds: undefined,
      });
    });

    it('should search with tribunal name filter', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([mockSearchResults[0]]);

      const request = createMockRequest({
        query: 'harassment case',
        tribunalName: 'HRTO',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);

      expect(embeddingService.searchSimilarCasesByText).toHaveBeenCalledWith('harassment case', {
        similarityThreshold: 0.7,
        maxResults: 10,
        tribunalName: 'HRTO',
        discriminationGrounds: undefined,
      });
    });

    it('should search with discrimination grounds filter', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'age discrimination',
        discriminationGrounds: ['age', 'employment'],
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);

      expect(embeddingService.searchSimilarCasesByText).toHaveBeenCalledWith('age discrimination', {
        similarityThreshold: 0.7,
        maxResults: 10,
        tribunalName: undefined,
        discriminationGrounds: ['age', 'employment'],
      });
    });

    it('should handle empty results', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([]);

      const request = createMockRequest({
        query: 'very specific query with no matches',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.resultsCount).toBe(0);
      expect(json.results).toEqual([]);
    });
  });

  describe('Validation Errors - Query', () => {
    it('should reject missing query', async () => {
      const request = createMockRequest({
        similarityThreshold: 0.8,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Query text is required');
    });

    it('should reject null query', async () => {
      const request = createMockRequest({
        query: null,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Query text is required');
    });

    it('should reject empty string query', async () => {
      const request = createMockRequest({
        query: '',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Query text is required');
    });

    it('should reject whitespace-only query', async () => {
      const request = createMockRequest({
        query: '   ',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Query text is required');
    });

    it('should reject non-string query', async () => {
      const request = createMockRequest({
        query: 123,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Query text is required');
    });
  });

  describe('Validation Errors - Similarity Threshold', () => {
    it('should reject similarity threshold below 0', async () => {
      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: -0.1,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Similarity threshold must be between 0 and 1');
    });

    it('should reject similarity threshold above 1', async () => {
      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 1.5,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Similarity threshold must be between 0 and 1');
    });

    it('should accept similarity threshold of 0', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([]);

      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 0,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept similarity threshold of 1', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([]);

      const request = createMockRequest({
        query: 'test query',
        similarityThreshold: 1,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Validation Errors - Max Results', () => {
    it('should reject maxResults below 1', async () => {
      const request = createMockRequest({
        query: 'test query',
        maxResults: 0,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Max results must be between 1 and 100');
    });

    it('should reject maxResults above 100', async () => {
      const request = createMockRequest({
        query: 'test query',
        maxResults: 101,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Max results must be between 1 and 100');
    });

    it('should accept maxResults of 1', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce([mockSearchResults[0]]);

      const request = createMockRequest({
        query: 'test query',
        maxResults: 1,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should accept maxResults of 100', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'test query',
        maxResults: 100,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Service Errors', () => {
    it('should handle service error', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = createMockRequest({
        query: 'test query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to search similar cases');
      expect(json.details).toBe('Database connection failed');
    });

    it('should handle unknown error', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockRejectedValueOnce('Unknown error');

      const request = createMockRequest({
        query: 'test query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to search similar cases');
      expect(json.details).toBe('Unknown error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long query text', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const longQuery = 'a'.repeat(5000);
      const request = createMockRequest({
        query: longQuery,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.query).toBe(longQuery);
    });

    it('should handle special characters in query', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'test @#$%^&*() query with spëcial çhars',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
    });

    it('should handle query with newlines', async () => {
      (embeddingService.searchSimilarCasesByText as any).mockResolvedValueOnce(mockSearchResults);

      const request = createMockRequest({
        query: 'line 1\nline 2\nline 3',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.query).toBe('line 1\nline 2\nline 3');
    });
  });

  describe('Request Parsing Errors', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to search similar cases');
    });

    it('should handle empty request body', async () => {
      const request = {
        json: async () => {
          throw new SyntaxError('Unexpected end of JSON input');
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to search similar cases');
    });
  });
});
