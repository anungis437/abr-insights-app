/**
 * Cases Statistics API
 * 
 * GET /api/cases/stats
 * 
 * Returns aggregated statistics for analytics dashboard:
 * - Total cases by classification category
 * - Cases by tribunal/source system
 * - Cases by document type
 * - Confidence score distribution
 * - Temporal trends (by month/year)
 * - Discrimination grounds frequency
 * - Average confidence scores
 * - Review status breakdown
 * 
 * Query Parameters:
 * - date_from: Filter by decision date (ISO date)
 * - date_to: Filter by decision date (ISO date)
 * - source_system: Filter by specific source
 * - classification: Filter by classification type
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse filters
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const source_system = searchParams.get('source_system');
    const classification = searchParams.get('classification');

    // Build base query for all statistics
    let baseQuery = supabase.from('tribunal_cases_raw').select('*');

    if (date_from) {
      baseQuery = baseQuery.gte('decision_date', date_from);
    }
    if (date_to) {
      baseQuery = baseQuery.lte('decision_date', date_to);
    }
    if (source_system) {
      baseQuery = baseQuery.eq('source_system', source_system);
    }

    // Fetch all cases for statistics
    const { data: cases, error } = await baseQuery;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch statistics', details: error.message },
        { status: 500 }
      );
    }

    if (!cases) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    // Apply classification filter if specified
    const filteredCases = classification
      ? cases.filter(c => {
          const aiCategory = (c.ai_classification as any)?.category;
          const rbCategory = (c.rule_based_classification as any)?.category;
          return aiCategory === classification || rbCategory === classification;
        })
      : cases;

    // Calculate statistics
    const stats = {
      total: filteredCases.length,
      
      // Classification breakdown
      byClassification: {
        anti_black_racism: filteredCases.filter(c => {
          const aiCat = (c.ai_classification as any)?.category;
          const rbCat = (c.rule_based_classification as any)?.category;
          return aiCat === 'anti_black_racism' || rbCat === 'anti_black_racism';
        }).length,
        other_discrimination: filteredCases.filter(c => {
          const aiCat = (c.ai_classification as any)?.category;
          const rbCat = (c.rule_based_classification as any)?.category;
          return (aiCat === 'other_discrimination' || rbCat === 'other_discrimination') &&
                 aiCat !== 'anti_black_racism' && rbCat !== 'anti_black_racism';
        }).length,
        non_discrimination: filteredCases.filter(c => {
          const aiCat = (c.ai_classification as any)?.category;
          const rbCat = (c.rule_based_classification as any)?.category;
          return (aiCat === 'non_discrimination' || rbCat === 'non_discrimination') &&
                 aiCat !== 'anti_black_racism' && rbCat !== 'anti_black_racism' &&
                 aiCat !== 'other_discrimination' && rbCat !== 'other_discrimination';
        }).length,
      },

      // Source system breakdown
      bySourceSystem: Object.entries(
        filteredCases.reduce((acc, c) => {
          const source = c.source_system || 'unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([source, count]) => ({ source, count })),

      // Document type breakdown
      byDocumentType: Object.entries(
        filteredCases.reduce((acc, c) => {
          const type = c.document_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count })),

      // Confidence distribution
      confidenceDistribution: {
        high: filteredCases.filter(c => (c.combined_confidence || 0) >= 0.8).length,
        medium: filteredCases.filter(c => (c.combined_confidence || 0) >= 0.5 && (c.combined_confidence || 0) < 0.8).length,
        low: filteredCases.filter(c => (c.combined_confidence || 0) < 0.5).length,
        average: filteredCases.length > 0
          ? filteredCases.reduce((sum, c) => sum + (c.combined_confidence || 0), 0) / filteredCases.length
          : 0,
      },

      // Review status
      reviewStatus: {
        needsReview: filteredCases.filter(c => c.needs_review).length,
        reviewed: filteredCases.filter(c => !c.needs_review).length,
      },

      // Temporal trends (by year-month)
      temporalTrends: Object.entries(
        filteredCases.reduce((acc, c) => {
          if (c.decision_date) {
            const month = c.decision_date.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month)),

      // Discrimination grounds frequency (top 10)
      topDiscriminationGrounds: Object.entries(
        filteredCases.reduce((acc, c) => {
          const grounds = (c.discrimination_grounds as string[]) || [];
          grounds.forEach(ground => {
            acc[ground] = (acc[ground] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([ground, count]) => ({ ground, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      // Language breakdown
      byLanguage: Object.entries(
        filteredCases.reduce((acc, c) => {
          const lang = c.language || 'unknown';
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([language, count]) => ({ language, count })),
    };

    return NextResponse.json({
      data: stats,
      filters: {
        date_from,
        date_to,
        source_system,
        classification,
      },
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
