import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = createClient as ReturnType<typeof vi.fn>;

describe('GET /api/admin/ml/embedding-jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockSupabase = (data: any = null, error: any = null) => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  });

  describe('Successful Jobs Retrieval', () => {
    it('should return list of embedding jobs', async () => {
      const mockJobs = [
        { id: 1, entity_type: 'case', status: 'completed', created_at: '2024-01-01T00:00:00Z' },
        { id: 2, entity_type: 'course', status: 'in_progress', created_at: '2024-01-02T00:00:00Z' },
        { id: 3, entity_type: 'lesson', status: 'pending', created_at: '2024-01-03T00:00:00Z' },
      ];
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        jobs: mockJobs,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('embedding_jobs');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no jobs exist', async () => {
      const mockSupabase = createMockSupabase([]);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobs).toEqual([]);
    });

    it('should handle jobs with minimal data', async () => {
      const mockJobs = [{ id: 1 }];
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobs).toHaveLength(1);
      expect(data.jobs[0].id).toBe(1);
    });

    it('should handle jobs with all statuses', async () => {
      const mockJobs = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'in_progress' },
        { id: 3, status: 'completed' },
        { id: 4, status: 'failed' },
      ];
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toHaveLength(4);
    });
  });

  describe('Query Errors', () => {
    it('should handle Supabase query error', async () => {
      const mockSupabase = createMockSupabase(null, {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
      });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch embedding jobs');
      expect(data.details).toBe('Unknown error'); // Non-Error objects become 'Unknown error'
    });

    it('should handle query error without details', async () => {
      const mockSupabase = createMockSupabase(null, { message: 'Query failed' });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch embedding jobs');
      expect(data.details).toBe('Unknown error'); // Non-Error objects become 'Unknown error'
    });

    it('should handle error with code only', async () => {
      const mockSupabase = createMockSupabase(null, { code: '42P01' });
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch embedding jobs');
      expect(data.details).toBeDefined();
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
      expect(data.error).toBe('Failed to fetch embedding jobs');
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
    it('should handle maximum limit of jobs (50)', async () => {
      const mockJobs = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        status: 'completed',
      }));
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toHaveLength(50);
    });

    it('should handle jobs with very old timestamps', async () => {
      const mockJobs = [{ id: 1, created_at: '1970-01-01T00:00:00Z' }];
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs[0].created_at).toBe('1970-01-01T00:00:00Z');
    });

    it('should handle jobs with null values', async () => {
      const mockJobs = [{ id: 1, entity_type: null, status: null }];
      const mockSupabase = createMockSupabase(mockJobs);
      mockCreateClient.mockReturnValue(mockSupabase);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs[0].entity_type).toBeNull();
    });
  });
});
