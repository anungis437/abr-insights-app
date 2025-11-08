/**
 * API Route: Search Similar Cases
 * 
 * POST /api/embeddings/search-cases
 * 
 * Performs semantic similarity search for tribunal cases using vector embeddings
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchSimilarCasesByText } from '@/lib/services/embedding-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      similarityThreshold = 0.7,
      maxResults = 10,
      tribunalName,
      discriminationGrounds,
    } = body

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query text is required' },
        { status: 400 }
      )
    }

    // Validate similarity threshold
    if (similarityThreshold < 0 || similarityThreshold > 1) {
      return NextResponse.json(
        { error: 'Similarity threshold must be between 0 and 1' },
        { status: 400 }
      )
    }

    // Validate max results
    if (maxResults < 1 || maxResults > 100) {
      return NextResponse.json(
        { error: 'Max results must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Perform search
    const results = await searchSimilarCasesByText(query, {
      similarityThreshold,
      maxResults,
      tribunalName,
      discriminationGrounds,
    })

    return NextResponse.json({
      success: true,
      query,
      resultsCount: results.length,
      results,
    })
  } catch (error) {
    console.error('Error searching similar cases:', error)
    return NextResponse.json(
      {
        error: 'Failed to search similar cases',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
