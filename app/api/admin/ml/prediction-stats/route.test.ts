import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = createClient as ReturnType<typeof vi.fn>;

describe('GET /api/admin/ml/prediction-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create Supabase mock with different query patterns
  const createMockSupabase = (
    totalCount: number = 0,
    validatedCount: number = 0,
    accurateData: any[] = [],
    avgConfidenceData: any[] = [],
    errors: {
      totalError?: any;
      validatedError?: any;
      accuracyError?: any;
      avgError?: any;
    } = {}
  ) => {
    let callCount = 0;
    
    return {
      from: vi.fn(() => {
        callCount++;
        const currentCall = callCount;
        
        return {
          select: vi.fn((fields: string, options?: any) => {
            // First call: total count query with head: true
            if (currentCall === 1 && options?.count === 'exact' && options?.head === true) {
              return Promise.resolve({ count: totalCount, error: errors.totalError || null });
            }
            
            // Second call: validated count query with head: true, followed by .not()
            if (currentCall === 2 && options?.count === 'exact' && options?.head === true) {
              return {
                not: vi.fn(() => 
                  Promise.resolve({ count: validatedCount, error: errors.validatedError || null })
                ),
              };
            }
            
            // Third call: accuracy query with data selection, followed by .not()
            if (currentCall === 3 && fields === 'id, predicted_outcome, actual_outcome') {
              return {
                not: vi.fn(() => 
                  Promise.resolve({ data: accurateData, error: errors.accuracyError || null })
                ),
              };
            }
            
            // Fourth call: avg confidence query
            if (currentCall === 4 && fields === 'confidence_score') {
              return Promise.resolve({ data: avgConfidenceData, error: errors.avgError || null });
            }
            
            return Promise.resolve({ data: [], error: null });
          }),
        };
      }),
    };
  };

  describe('Successful Prediction Stats', () => {
    it('should return complete prediction statistics', async () => {
      // 450 accurate out of 500 validated = 90% accuracy
      const accurateData = Array(450).fill({ predicted_outcome: 'A', actual_outcome: 'A' })
        .concat(Array(50).fill({ predicted_outcome: 'A', actual_outcome: 'B' }));
      const avgData = Array(1000).fill({ confidence_score: 0.85 });
      
      const mockSupabase = createMockSupabase(
        1000, // totalCount
        500,  // validatedCount
        accurateData,
        avgData
      );
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        stats: {
          totalPredictions: 1000,
          validatedPredictions: 500,
          accuracy: 90, // 450/500 * 100
          averageConfidence: 85, // 0.85 * 100
        },
      });
    });

    it('should handle zero predictions', async () => {
      const mockSupabase = createMockSupabase(0, 0, [], []);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        totalPredictions: 0,
        validatedPredictions: 0,
        accuracy: 0,
        averageConfidence: 0,
      });
    });

    it('should handle no validated predictions', async () => {
      const avgData = Array(100).fill({ confidence_score: 0.75 });
      const mockSupabase = createMockSupabase(100, 0, [], avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.accuracy).toBe(0);
    });

    it('should handle 100% accuracy', async () => {
      // All 200 validated predictions are accurate
      const accurateData = Array(200).fill({ predicted_outcome: 'A', actual_outcome: 'A' });
      const avgData = Array(500).fill({ confidence_score: 0.95 });
      const mockSupabase = createMockSupabase(500, 200, accurateData, avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.accuracy).toBe(100);
    });

    it('should handle null average confidence', async () => {
      // 40 accurate out of 50 validated = 80% accuracy
      const accurateData = Array(40).fill({ predicted_outcome: 'A', actual_outcome: 'A' })
        .concat(Array(10).fill({ predicted_outcome: 'A', actual_outcome: 'B' }));
      // Empty avgData results in 0 average
      const mockSupabase = createMockSupabase(100, 50, accurateData, []);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.averageConfidence).toBe(0);
    });
  });

  describe('Query Errors', () => {
    it('should handle error in total predictions count', async () => {
      const mockSupabase = createMockSupabase(0, 0, [], [], {
        totalError: { message: 'Count query failed', code: '42P01' }
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch prediction statistics');
      expect(data.details).toBe('Unknown error');
    });

    it('should handle error in validated predictions count', async () => {
      const mockSupabase = createMockSupabase(100, 0, [], [], {
        validatedError: { message: 'Validated count failed' }
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch prediction statistics');
      expect(data.details).toBe('Unknown error');
    });

    it('should handle error in accurate predictions count', async () => {
      const mockSupabase = createMockSupabase(100, 50, [], [], {
        accuracyError: { message: 'Accurate count failed' }
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch prediction statistics');
      expect(data.details).toBe('Unknown error');
    });

    it('should handle error in average confidence query', async () => {
      const accurateData = Array(40).fill({ predicted_outcome: 'A', actual_outcome: 'A' });
      const mockSupabase = createMockSupabase(100, 50, accurateData, [], {
        avgError: { message: 'Avg confidence query failed' }
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch prediction statistics');
      expect(data.details).toBe('Unknown error');
    });
  });

  describe('Exception Handling', () => {
    it('should handle thrown Error from Supabase', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation(() => {
          throw new Error('Connection timeout');
        }),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch prediction statistics');
      expect(data.details).toBe('Connection timeout');
    });

    it('should handle unknown error type', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation(() => {
          throw 'Unknown error';
        }),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle null error', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation(() => {
          throw null;
        }),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large prediction counts', async () => {
      // 4.5M accurate out of 5M validated = 90% accuracy
      const accurateData = Array(4500000).fill({ predicted_outcome: 'A', actual_outcome: 'A' })
        .concat(Array(500000).fill({ predicted_outcome: 'A', actual_outcome: 'B' }));
      const avgData = Array(10000000).fill({ confidence_score: 0.82 });
      const mockSupabase = createMockSupabase(10000000, 5000000, accurateData, avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.totalPredictions).toBe(10000000);
    });

    it('should handle accuracy with rounding', async () => {
      // 1 accurate out of 3 validated = 33.33% accuracy
      const accurateData = [
        { predicted_outcome: 'A', actual_outcome: 'A' },
        { predicted_outcome: 'A', actual_outcome: 'B' },
        { predicted_outcome: 'B', actual_outcome: 'C' },
      ];
      const avgData = Array(100).fill({ confidence_score: 0.77 });
      const mockSupabase = createMockSupabase(100, 3, accurateData, avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.accuracy).toBeCloseTo(33.33, 2);
    });

    it('should handle very low accuracy', async () => {
      // 1 accurate out of 100 validated = 1% accuracy
      const accurateData = [{ predicted_outcome: 'A', actual_outcome: 'A' }]
        .concat(Array(99).fill({ predicted_outcome: 'A', actual_outcome: 'B' }));
      const avgData = Array(1000).fill({ confidence_score: 0.45 });
      const mockSupabase = createMockSupabase(1000, 100, accurateData, avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.accuracy).toBe(1);
    });

    it('should handle very high confidence', async () => {
      // 48 accurate out of 50 validated = 96% accuracy
      const accurateData = Array(48).fill({ predicted_outcome: 'A', actual_outcome: 'A' })
        .concat(Array(2).fill({ predicted_outcome: 'A', actual_outcome: 'B' }));
      const avgData = Array(100).fill({ confidence_score: 0.999999 });
      const mockSupabase = createMockSupabase(100, 50, accurateData, avgData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.averageConfidence).toBeCloseTo(100, 2); // 0.999999 * 100 = 99.9999 ≈ 100
    });
  });
});
