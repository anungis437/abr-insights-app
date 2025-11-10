import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = vi.fn();

// Mock environment variables
const mockEnv = {
  AZURE_OPENAI_ENDPOINT: 'https://test-openai.openai.azure.com',
  AZURE_OPENAI_API_KEY: 'test-api-key',
  AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4o',
  AZURE_OPENAI_API_VERSION: '2024-02-15-preview',
  NODE_ENV: 'test',
};

describe('POST /api/ai/coach', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  const createMockRequest = (body: any): NextRequest => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  const createMockAzureResponse = (content: string) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      choices: [
        {
          message: {
            role: 'assistant',
            content,
          },
        },
      ],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 250,
        total_tokens: 400,
      },
    }),
  });

  describe('Successful Coaching Sessions', () => {
    it('should generate comprehensive coaching session', async () => {
      const mockResponse = createMockAzureResponse('Comprehensive coaching insights here.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            completed: 5,
            inProgress: 2,
            totalPoints: 1500,
            currentStreak: 10,
            badgesEarned: 3,
            avgProgress: 75,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Comprehensive coaching insights here.');
      expect(json.recommendations).toBeDefined();
      expect(Array.isArray(json.recommendations)).toBe(true);
      expect(json.usage).toEqual({
        prompt_tokens: 150,
        completion_tokens: 250,
        total_tokens: 400,
      });
    });

    it('should generate learning path session', async () => {
      const mockResponse = createMockAzureResponse('Learning path suggestions here.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'learning_path',
        context: {
          stats: {
            completed: 3,
            inProgress: 1,
            avgProgress: 60,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Learning path suggestions here.');
      expect(json.learningPath).toEqual([]);
    });

    it('should generate at-risk support session', async () => {
      const mockResponse = createMockAzureResponse('Re-engagement strategies here.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'at_risk',
        context: {
          stats: {
            completed: 1,
            inProgress: 3,
            currentStreak: 0,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Re-engagement strategies here.');
    });

    it('should handle custom query session', async () => {
      const mockResponse = createMockAzureResponse('Personalized advice here.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'custom_query',
        query: 'How do I improve my quiz scores?',
        context: {
          stats: {
            completed: 8,
            inProgress: 1,
            totalPoints: 2500,
            currentStreak: 15,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Personalized advice here.');

      // Verify Azure OpenAI was called with custom query
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.messages[1].content).toBe('How do I improve my quiz scores?');
    });

    it('should handle missing context stats gracefully', async () => {
      const mockResponse = createMockAzureResponse('Coaching insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBeDefined();

      // Verify system prompt uses default values (0)
      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.messages[0].content).toContain('Completed Courses: 0');
      expect(body.messages[0].content).toContain('Total Points: 0');
    });

    it('should use default query for custom_query without query field', async () => {
      const mockResponse = createMockAzureResponse('General advice.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'custom_query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.messages[1].content).toBe('How can I improve my learning?');
    });
  });

  describe('Recommendations Generation', () => {
    it('should recommend completing in-progress courses (high priority)', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            inProgress: 3,
            currentStreak: 10,
            completed: 10,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.recommendations).toBeDefined();
      const highPriorityRec = json.recommendations.find((r: any) => r.priority === 'high');
      expect(highPriorityRec).toBeDefined();
      expect(highPriorityRec.title).toContain('Complete Your Current Courses');
      expect(highPriorityRec.description).toContain('3 course(s)');
    });

    it('should recommend building streak (medium priority)', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            currentStreak: 5,
            completed: 8,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      const mediumPriorityRec = json.recommendations.find((r: any) => r.priority === 'medium');
      expect(mediumPriorityRec).toBeDefined();
      expect(mediumPriorityRec.title).toContain('Build Your Learning Streak');
    });

    it('should recommend exploring resources (low priority)', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            completed: 2,
            currentStreak: 8,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      const lowPriorityRec = json.recommendations.find((r: any) => r.priority === 'low');
      expect(lowPriorityRec).toBeDefined();
      expect(lowPriorityRec.title).toContain('Practice Scenarios');
    });

    it('should not recommend completing courses when none in progress', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            inProgress: 0,
            completed: 10,
            currentStreak: 5,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      const highPriorityRec = json.recommendations.find((r: any) => r.priority === 'high');
      expect(highPriorityRec).toBeUndefined();
    });

    it('should not recommend streak building when streak >= 7', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            currentStreak: 15,
            completed: 2,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      const streakRec = json.recommendations.find((r: any) => r.title.includes('Streak'));
      expect(streakRec).toBeUndefined();
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing sessionType', async () => {
      const request = createMockRequest({
        query: 'Some query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Session type is required');
    });

    it('should reject null sessionType', async () => {
      const request = createMockRequest({
        sessionType: null,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Session type is required');
    });

    it('should reject empty string sessionType', async () => {
      const request = createMockRequest({
        sessionType: '',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Session type is required');
    });

    it('should reject invalid sessionType', async () => {
      const request = createMockRequest({
        sessionType: 'invalid_type',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid session type');
    });

    it('should reject non-string sessionType', async () => {
      const request = createMockRequest({
        sessionType: 123,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid session type');
    });
  });

  describe('Configuration Errors', () => {
    it('should return 500 when Azure endpoint is missing', async () => {
      delete process.env.AZURE_OPENAI_ENDPOINT;

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI is not properly configured');
    });

    it('should return 500 when API key is missing', async () => {
      delete process.env.AZURE_OPENAI_API_KEY;

      const request = createMockRequest({
        sessionType: 'learning_path',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI is not properly configured');
    });

    it('should return 500 when deployment name is missing', async () => {
      delete process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

      const request = createMockRequest({
        sessionType: 'at_risk',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI is not properly configured');
    });

    it('should return 500 when API version is missing', async () => {
      delete process.env.AZURE_OPENAI_API_VERSION;

      const request = createMockRequest({
        sessionType: 'custom_query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI is not properly configured');
    });
  });

  describe('Azure OpenAI API Errors', () => {
    it('should handle 401 unauthorized error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to generate coaching session');
    });

    it('should handle 429 rate limit error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const request = createMockRequest({
        sessionType: 'learning_path',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to generate coaching session');
    });

    it('should handle network timeout error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

      const request = createMockRequest({
        sessionType: 'at_risk',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to generate coaching session');
    });

    it('should handle missing choices in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Unable to generate insights.');
    });

    it('should handle empty choices array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const request = createMockRequest({
        sessionType: 'learning_path',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Unable to generate insights.');
    });

    it('should handle missing message content', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      });

      const request = createMockRequest({
        sessionType: 'custom_query',
        query: 'Test query',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBe('Unable to generate insights.');
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
      expect(json.error).toBe('Failed to generate coaching session');
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
      expect(json.error).toBe('Failed to generate coaching session');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large stats objects', async () => {
      const mockResponse = createMockAzureResponse('Insights for advanced learner.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            completed: 150,
            inProgress: 25,
            totalPoints: 999999,
            currentStreak: 365,
            badgesEarned: 100,
            avgProgress: 95,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBeDefined();
    });

    it('should handle negative/invalid stat values', async () => {
      const mockResponse = createMockAzureResponse('Coaching insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
        context: {
          stats: {
            completed: -5,
            inProgress: -2,
            totalPoints: -1000,
            currentStreak: -10,
          },
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBeDefined();
    });

    it('should handle very long custom queries', async () => {
      const longQuery = 'a'.repeat(5000);
      const mockResponse = createMockAzureResponse('Response to long query.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'custom_query',
        query: longQuery,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBeDefined();
    });

    it('should handle special characters in query', async () => {
      const mockResponse = createMockAzureResponse('Response with special handling.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'custom_query',
        query: 'How do I handle cases with émojis 🎓 and spëcial çhars?',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.insights).toBeDefined();
    });
  });

  describe('Development Mode', () => {
    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'development');
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Test error message'));

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.details).toBe('Test error message');

      vi.unstubAllEnvs();
    });

    it('should not include error details in production mode', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Test error message'));

      const request = createMockRequest({
        sessionType: 'learning_path',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.details).toBeUndefined();

      vi.unstubAllEnvs();
    });
  });

  describe('Azure OpenAI Parameters', () => {
    it('should send correct OpenAI parameters for all session types', async () => {
      const mockResponse = createMockAzureResponse('Test insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      await POST(request);

      const [url, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);

      expect(url).toContain('gpt-4o');
      expect(url).toContain('2024-02-15-preview');
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(2048);
      expect(body.top_p).toBe(0.95);
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['api-key']).toBe('test-api-key');
    });

    it('should include system and user prompts for comprehensive', async () => {
      const mockResponse = createMockAzureResponse('Insights.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'comprehensive',
      });

      await POST(request);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[0].content).toContain('comprehensive progress analysis');
      expect(body.messages[1].role).toBe('user');
      expect(body.messages[1].content).toContain('comprehensive review');
    });

    it('should include appropriate prompts for learning_path', async () => {
      const mockResponse = createMockAzureResponse('Learning path.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'learning_path',
      });

      await POST(request);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.messages[0].content).toContain('learning path designer');
      expect(body.messages[1].content).toContain('personalized learning path');
    });

    it('should include appropriate prompts for at_risk', async () => {
      const mockResponse = createMockAzureResponse('Support guidance.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        sessionType: 'at_risk',
      });

      await POST(request);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.messages[0].content).toContain('re-engage struggling learners');
      expect(body.messages[1].content).toContain('getting back on track');
    });
  });
});
