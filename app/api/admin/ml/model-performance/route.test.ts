import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import * as OutcomePredictionService from '@/lib/services/outcome-prediction-service';

vi.mock('@/lib/services/outcome-prediction-service', () => ({
  evaluateModel: vi.fn(),
}));

const mockEvaluateModel = OutcomePredictionService.evaluateModel as ReturnType<typeof vi.fn>;

describe('GET /api/admin/ml/model-performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Model Performance', () => {
    it('should return model performance metrics', async () => {
      const mockPerformance = {
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1Score: 0.85,
        timestamp: new Date().toISOString(),
      };
      mockEvaluateModel.mockResolvedValue(mockPerformance);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        performance: mockPerformance,
      });
      expect(mockEvaluateModel).toHaveBeenCalledOnce();
    });

    it('should return performance with minimal metrics', async () => {
      mockEvaluateModel.mockResolvedValue({
        accuracy: 0.75,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance).toBeDefined();
      expect(data.performance.accuracy).toBe(0.75);
    });

    it('should handle performance with zero values', async () => {
      mockEvaluateModel.mockResolvedValue({
        accuracy: 0,
        precision: 0,
        recall: 0,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance.accuracy).toBe(0);
    });
  });

  describe('Service Errors', () => {
    it('should handle service throwing error with message', async () => {
      mockEvaluateModel.mockRejectedValue(
        new Error('Model evaluation failed: Insufficient data')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch model performance metrics',
        details: 'Model evaluation failed: Insufficient data',
      });
    });

    it('should handle service error without details', async () => {
      mockEvaluateModel.mockRejectedValue(new Error('Service unavailable'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch model performance metrics');
      expect(data.details).toBe('Service unavailable');
    });
  });

  describe('Exception Handling', () => {
    it('should handle thrown Error', async () => {
      mockEvaluateModel.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch model performance metrics');
      expect(data.details).toBe('Database connection failed');
    });

    it('should handle unknown error type', async () => {
      mockEvaluateModel.mockRejectedValue('Unknown error');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle null rejection', async () => {
      mockEvaluateModel.mockRejectedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle timeout error', async () => {
      mockEvaluateModel.mockRejectedValue(new Error('Request timeout'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch model performance metrics');
      expect(data.details).toBe('Request timeout');
    });

    it('should handle performance with very high accuracy', async () => {
      mockEvaluateModel.mockResolvedValue({
        accuracy: 0.999999,
        precision: 1.0,
        recall: 0.999,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance.accuracy).toBeCloseTo(0.999999, 6);
    });

    it('should handle performance with large dataset indicators', async () => {
      mockEvaluateModel.mockResolvedValue({
        accuracy: 0.82,
        totalSamples: 1000000,
        evaluationTime: 3600000,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.performance.totalSamples).toBe(1000000);
    });
  });
});
