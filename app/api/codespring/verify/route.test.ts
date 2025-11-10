import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the codespring service
vi.mock('@/lib/services/codespring', () => ({
  verifyCodespringApiKey: vi.fn(),
}));

import { verifyCodespringApiKey } from '@/lib/services/codespring';

describe('GET /api/codespring/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (): NextRequest => {
    return {} as NextRequest;
  };

  describe('Successful Verification', () => {
    it('should verify valid API key', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: true,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.message).toBe('Codespring API key is valid and working');
      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should include timestamp in ISO format', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: true,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should call verification service', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: true,
      });

      const request = createMockRequest();
      await GET(request);

      expect(verifyCodespringApiKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('Verification Failures', () => {
    it('should handle invalid API key', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: false,
        error: 'Invalid API key',
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Invalid API key');
      expect(data.message).toBe('Please check your CODESPRING_API_KEY environment variable');
    });

    it('should handle missing API key', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: false,
        error: 'API key not configured',
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('API key not configured');
    });

    it('should handle authentication failure', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: false,
        error: 'Authentication failed',
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Authentication failed');
    });

    it('should handle verification failure without error message', async () => {
      (verifyCodespringApiKey as any).mockResolvedValue({
        valid: false,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('API key verification failed');
      expect(data.message).toBe('Please check your CODESPRING_API_KEY environment variable');
    });
  });

  describe('Exception Handling', () => {
    it('should handle thrown Error', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(new Error('Network timeout'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Network timeout');
    });

    it('should handle unknown error type', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue('Unknown error');

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Verification failed');
    });

    it('should handle null rejection', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(null);

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Verification failed');
    });

    it('should handle service unavailable', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Service unavailable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle verification timeout', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(new Error('Request timeout'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Request timeout');
    });

    it('should handle DNS resolution error', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(new Error('DNS lookup failed'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('DNS lookup failed');
    });

    it('should handle SSL certificate error', async () => {
      (verifyCodespringApiKey as any).mockRejectedValue(new Error('SSL certificate error'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.valid).toBe(false);
      expect(data.error).toBe('SSL certificate error');
    });
  });
});
