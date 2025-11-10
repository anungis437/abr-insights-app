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

describe('POST /api/ai/chat', () => {
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

  const createMockAzureResponse = (content: string, usage = { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }) => ({
    ok: true,
    status: 200,
    json: async () => ({
      choices: [
        {
          message: {
            role: 'assistant',
            content,
          },
        },
      ],
      usage,
    }),
  });

  describe('Successful Chat Completions', () => {
    it('should return AI response for valid message', async () => {
      const mockResponse = createMockAzureResponse('This is a helpful AI response about anti-Black racism.');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'What is systemic racism?',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.response).toBe('This is a helpful AI response about anti-Black racism.');
      expect(json.usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      });
    });

    it('should include context in system prompt when provided', async () => {
      const mockResponse = createMockAzureResponse('Response with context');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Tell me about tribunal cases',
        context: {
          casesCount: 150,
          coursesCount: 25,
          completedCount: 5,
        },
      });

      await POST(request);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as any).mock.calls[0];
      
      expect(url).toContain('https://test-openai.openai.azure.com');
      expect(url).toContain('gpt-4o');
      expect(url).toContain('2024-02-15-preview');
      
      const body = JSON.parse(options.body);
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[0].content).toContain('150 tribunal cases');
      expect(body.messages[0].content).toContain('25 training courses');
      expect(body.messages[0].content).toContain('completed 5 courses');
      expect(body.messages[1].role).toBe('user');
      expect(body.messages[1].content).toBe('Tell me about tribunal cases');
    });

    it('should use default context values when not provided', async () => {
      const mockResponse = createMockAzureResponse('Response without context');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Hello',
      });

      await POST(request);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);
      
      expect(body.messages[0].content).toContain('0 tribunal cases');
      expect(body.messages[0].content).toContain('0 training courses');
      expect(body.messages[0].content).toContain('completed 0 courses');
    });

    it('should send correct OpenAI parameters', async () => {
      const mockResponse = createMockAzureResponse('Test response');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test message',
      });

      await POST(request);

      const [, options] = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(options.body);
      
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(2048);
      expect(body.top_p).toBe(0.95);
      expect(body.frequency_penalty).toBe(0);
      expect(body.presence_penalty).toBe(0);
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['api-key']).toBe('test-api-key');
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing message', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });

    it('should reject null message', async () => {
      const request = createMockRequest({ message: null });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });

    it('should reject non-string message', async () => {
      const request = createMockRequest({ message: 123 });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });

    it('should reject empty string message', async () => {
      const request = createMockRequest({ message: '' });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });

    it('should reject array message', async () => {
      const request = createMockRequest({ message: ['test'] });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });

    it('should reject object message', async () => {
      const request = createMockRequest({ message: { text: 'test' } });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Message is required');
    });
  });

  describe('Configuration Errors', () => {
    it('should return 500 when Azure endpoint is missing', async () => {
      delete process.env.AZURE_OPENAI_ENDPOINT;

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('AI service not configured');
    });

    it('should return 500 when API key is missing', async () => {
      delete process.env.AZURE_OPENAI_API_KEY;

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('AI service not configured');
    });

    it('should use default deployment name when not configured', async () => {
      delete process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
      
      const mockResponse = createMockAzureResponse('Test response');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test message',
      });

      await POST(request);

      const [url] = (global.fetch as any).mock.calls[0];
      expect(url).toContain('/deployments/gpt-4o/');
    });

    it('should use default API version when not configured', async () => {
      delete process.env.AZURE_OPENAI_API_VERSION;
      
      const mockResponse = createMockAzureResponse('Test response');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test message',
      });

      await POST(request);

      const [url] = (global.fetch as any).mock.calls[0];
      expect(url).toContain('api-version=2024-02-15-preview');
    });
  });

  describe('Azure OpenAI API Errors', () => {
    it('should handle 401 unauthorized error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI API returned 401');
    });

    it('should handle 429 rate limit error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI API returned 429');
    });

    it('should handle 500 Azure OpenAI error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Azure OpenAI API returned 500');
    });

    it('should handle network timeout error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Network timeout');
    });

    it('should handle invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'structure' }),
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Invalid response from Azure OpenAI');
    });

    it('should handle missing choices in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Invalid response from Azure OpenAI');
    });

    it('should handle empty choices array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Invalid response from Azure OpenAI');
    });

    it('should handle missing message in choice', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{}] }),
      });

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Invalid response from Azure OpenAI');
    });
  });

  describe('Request Parsing Errors', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as NextRequest;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Unexpected token');
    });

    it('should handle empty request body', async () => {
      const request = {
        json: async () => {
          throw new SyntaxError('Unexpected end of JSON input');
        },
      } as NextRequest;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Unexpected end of JSON input');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const mockResponse = createMockAzureResponse('Response to long message');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: longMessage,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.response).toBe('Response to long message');
    });

    it('should handle messages with special characters', async () => {
      const mockResponse = createMockAzureResponse('Response with special chars');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test with émojis 🎉 and spëcial çhars: @#$%^&*()',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.response).toBe('Response with special chars');
    });

    it('should handle messages with newlines', async () => {
      const mockResponse = createMockAzureResponse('Multi-line response');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Line 1\nLine 2\nLine 3',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.response).toBe('Multi-line response');
    });

    it('should handle endpoint with trailing slash', async () => {
      process.env.AZURE_OPENAI_ENDPOINT = 'https://test-openai.openai.azure.com/';
      
      const mockResponse = createMockAzureResponse('Test response');
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test message',
      });

      await POST(request);

      const [url] = (global.fetch as any).mock.calls[0];
      // Should not have double slashes
      expect(url).not.toContain('//openai');
      expect(url).toContain('https://test-openai.openai.azure.com/openai');
    });

    it('should handle zero usage tokens', async () => {
      const mockResponse = createMockAzureResponse('Test response', {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const request = createMockRequest({
        message: 'Test',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.usage.total_tokens).toBe(0);
    });
  });

  describe('Development Mode', () => {
    it('should include stack trace in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Test error with stack'));

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.details).toBeDefined();
    });

    it('should not include stack trace in production mode', async () => {
      process.env.NODE_ENV = 'production';
      
      (global.fetch as any).mockRejectedValueOnce(new Error('Test error'));

      const request = createMockRequest({
        message: 'Test message',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.details).toBeUndefined();
    });
  });
});
