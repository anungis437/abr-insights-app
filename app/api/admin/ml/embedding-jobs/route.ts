import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all embedding jobs ordered by most recent first
    const { data: jobs, error } = await supabase
      .from('embedding_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
    });
  } catch (error) {
    console.error('Error fetching embedding jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch embedding jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
