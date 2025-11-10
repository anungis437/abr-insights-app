import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = createClient as ReturnType<typeof vi.fn>;

describe('GET /api/admin/ml/coverage-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockSupabase = (data: any = null, error: any = null) => ({
    rpc: vi.fn().mockResolvedValue({ data, error }),
  });

  describe('Successful Coverage Stats', () => {
    it('should return coverage stats for all entity types', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 100, embedded_count: 80, coverage_percentage: 80 },
        { entity_type: 'courses', total_count: 50, embedded_count: 40, coverage_percentage: 80 },
        { entity_type: 'lessons', total_count: 200, embedded_count: 150, coverage_percentage: 75 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        stats: {
          cases: { total: 100, embedded: 80, coverage: 80 },
          courses: { total: 50, embedded: 40, coverage: 80 },
          lessons: { total: 200, embedded: 150, coverage: 75 },
        },
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_embedding_coverage_stats');
    });

    it('should handle zero coverage', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 100, embedded_count: 0, coverage_percentage: 0 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.cases.coverage).toBe(0);
    });

    it('should handle 100% coverage', async () => {
      const mockData = [
        { entity_type: 'courses', total_count: 50, embedded_count: 50, coverage_percentage: 100 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.courses.coverage).toBe(100);
    });

    it('should handle missing entity types with zero values', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 100, embedded_count: 80, coverage_percentage: 80 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.courses).toEqual({ total: 0, embedded: 0, coverage: 0 });
      expect(data.stats.lessons).toEqual({ total: 0, embedded: 0, coverage: 0 });
    });

    it('should handle partial coverage with rounding', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 3, embedded_count: 1, coverage_percentage: 33.33 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.cases.coverage).toBeCloseTo(33.33, 2);
    });
  });

  describe('Empty or Null Data', () => {
    it('should handle empty array response', async () => {
      const mockSupabase = createMockSupabase([]);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual({
        cases: { total: 0, embedded: 0, coverage: 0 },
        courses: { total: 0, embedded: 0, coverage: 0 },
        lessons: { total: 0, embedded: 0, coverage: 0 },
      });
    });

    it('should handle null data', async () => {
      const mockSupabase = createMockSupabase(null);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual({
        cases: { total: 0, embedded: 0, coverage: 0 },
        courses: { total: 0, embedded: 0, coverage: 0 },
        lessons: { total: 0, embedded: 0, coverage: 0 },
      });
    });
  });

  describe('RPC Errors', () => {
    it('should handle RPC error', async () => {
      const mockSupabase = createMockSupabase(null, {
        message: 'RPC function not found',
        code: '42883',
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch coverage statistics');
      expect(data.details).toBe('Unknown error'); // Non-Error objects become 'Unknown error'
    });

    it('should handle RPC error without details', async () => {
      const mockSupabase = createMockSupabase(null, { message: 'RPC failed' });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch coverage statistics');
      expect(data.details).toBe('Unknown error'); // Non-Error objects become 'Unknown error'
    });

    it('should handle permission denied error', async () => {
      const mockSupabase = createMockSupabase(null, {
        message: 'Permission denied',
        code: '42501',
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch coverage statistics');
      expect(data.details).toBe('Unknown error'); // Non-Error objects become 'Unknown error'
    });
  });

  describe('Exception Handling', () => {
    it('should handle thrown Error from Supabase', async () => {
      const mockSupabase = {
        rpc: vi.fn().mockRejectedValue(new Error('Connection timeout')),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch coverage statistics');
      expect(data.details).toBe('Connection timeout');
    });

    it('should handle unknown error type', async () => {
      const mockSupabase = {
        rpc: vi.fn().mockRejectedValue('Unknown error'),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle null error', async () => {
      const mockSupabase = {
        rpc: vi.fn().mockRejectedValue(null),
      };
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large counts', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 1000000, embedded_count: 999999, coverage_percentage: 99.9999 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.cases.total).toBe(1000000);
      expect(data.stats.cases.embedded).toBe(999999);
    });

    it('should handle unknown entity type (should not affect known types)', async () => {
      const mockData = [
        { entity_type: 'cases', total_count: 100, embedded_count: 80, coverage_percentage: 80 },
        { entity_type: 'unknown', total_count: 50, embedded_count: 40, coverage_percentage: 80 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.cases).toBeDefined();
      expect(data.stats.courses).toBeDefined();
      expect(data.stats.lessons).toBeDefined();
    });

    it('should handle data with zero totals but non-zero embedded', async () => {
      const mockData = [
        { entity_type: 'case', total_count: 0, embedded_count: 5 },
      ];
      const mockSupabase = createMockSupabase(mockData);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.cases.coverage).toBe(0);
    });
  });
});
