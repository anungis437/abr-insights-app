import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Call the database function to get embedding coverage statistics
    const { data, error } = await supabase.rpc('get_embedding_coverage_stats');

    if (error) {
      throw error;
    }

    // Transform the data into a more usable format
    const stats = {
      cases: {
        total: 0,
        embedded: 0,
        coverage: 0,
      },
      courses: {
        total: 0,
        embedded: 0,
        coverage: 0,
      },
      lessons: {
        total: 0,
        embedded: 0,
        coverage: 0,
      },
    };

    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        const type = row.entity_type as 'cases' | 'courses' | 'lessons';
        if (type === 'cases' || type === 'courses' || type === 'lessons') {
          stats[type] = {
            total: row.total_count || 0,
            embedded: row.embedded_count || 0,
            coverage: row.coverage_percentage || 0,
          };
        }
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching coverage stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coverage statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
