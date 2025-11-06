/**
 * Cases API - List and Filter
 * 
 * GET /api/cases
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - classification: Filter by classification type (anti_black_racism, other_discrimination, non_discrimination)
 * - source_system: Filter by source system (canlii_hrto, canlii_chrt, etc.)
 * - date_from: Filter by decision date (ISO date)
 * - date_to: Filter by decision date (ISO date)
 * - document_type: Filter by type (decision, settlement, mediation, consent_order)
 * - language: Filter by language (en, fr)
 * - min_confidence: Minimum confidence score (0-1)
 * - needs_review: Show only cases needing review (true/false)
 * - sort: Sort field (decision_date, confidence, created_at)
 * - order: Sort order (asc, desc)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CasesQuery {
  page: number;
  limit: number;
  classification?: string;
  source_system?: string;
  date_from?: string;
  date_to?: string;
  document_type?: string;
  language?: string;
  min_confidence?: number;
  needs_review?: boolean;
  sort: string;
  order: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const query: CasesQuery = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
      classification: searchParams.get('classification') || undefined,
      source_system: searchParams.get('source_system') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      document_type: searchParams.get('document_type') || undefined,
      language: searchParams.get('language') || undefined,
      min_confidence: searchParams.get('min_confidence') ? parseFloat(searchParams.get('min_confidence')!) : undefined,
      needs_review: searchParams.get('needs_review') === 'true',
      sort: searchParams.get('sort') || 'decision_date',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
    };

    // Validate pagination
    if (query.page < 1) {
      return NextResponse.json(
        { error: 'Page must be >= 1' },
        { status: 400 }
      );
    }

    if (query.limit < 1 || query.limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build Supabase query
    let supabaseQuery = supabase
      .from('tribunal_cases_raw')
      .select('*', { count: 'exact' });

    // Apply filters
    if (query.classification) {
      // Filter by AI classification category if available, otherwise fall back to rule-based
      supabaseQuery = supabaseQuery.or(
        `ai_classification->>category.eq.${query.classification},rule_based_classification->>category.eq.${query.classification}`
      );
    }

    if (query.source_system) {
      supabaseQuery = supabaseQuery.eq('source_system', query.source_system);
    }

    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('decision_date', query.date_from);
    }

    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('decision_date', query.date_to);
    }

    if (query.document_type) {
      supabaseQuery = supabaseQuery.eq('document_type', query.document_type);
    }

    if (query.language) {
      supabaseQuery = supabaseQuery.eq('language', query.language);
    }

    if (query.min_confidence !== undefined) {
      supabaseQuery = supabaseQuery.gte('combined_confidence', query.min_confidence);
    }

    if (query.needs_review) {
      supabaseQuery = supabaseQuery.eq('needs_review', true);
    }

    // Apply sorting
    const sortColumn = query.sort === 'confidence' ? 'combined_confidence' : query.sort;
    supabaseQuery = supabaseQuery.order(sortColumn, { ascending: query.order === 'asc' });

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery.range(offset, offset + query.limit - 1);

    // Execute query
    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / query.limit) : 0;
    const hasNextPage = query.page < totalPages;
    const hasPreviousPage = query.page > 1;

    return NextResponse.json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        classification: query.classification,
        source_system: query.source_system,
        date_from: query.date_from,
        date_to: query.date_to,
        document_type: query.document_type,
        language: query.language,
        min_confidence: query.min_confidence,
        needs_review: query.needs_review,
      },
      sort: {
        field: query.sort,
        order: query.order,
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
