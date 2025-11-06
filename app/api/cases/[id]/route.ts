/**
 * Single Case API - Get by ID
 * 
 * GET /api/cases/[id]
 * 
 * Returns full case details including:
 * - All metadata (case number, title, dates, parties)
 * - Full text content
 * - Classification results (rule-based and AI)
 * - Discrimination grounds, key issues, remedies
 * - Extraction quality and review status
 * - Related ingestion job information
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid case ID format' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch case with ingestion job details
    const { data, error } = await supabase
      .from('tribunal_cases_raw')
      .select(`
        *,
        ingestion_job:ingestion_jobs(
          id,
          job_type,
          source_system,
          status,
          started_at,
          completed_at,
          cases_stored,
          avg_confidence_score
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        );
      }

      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch case', details: error.message },
        { status: 500 }
      );
    }

    // Parse JSONB fields
    const caseData = {
      ...data,
      rule_based_classification: data.rule_based_classification as Record<string, any>,
      ai_classification: data.ai_classification as Record<string, any> | null,
      discrimination_grounds: data.discrimination_grounds as string[],
      key_issues: data.key_issues as string[],
      remedies: data.remedies as string[],
      extraction_errors: data.extraction_errors as any[],
    };

    return NextResponse.json(caseData);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
