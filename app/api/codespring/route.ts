import { NextRequest, NextResponse } from 'next/server'
import { getCodespringClient } from '@/lib/services/codespring'
import { requireAnyPermission } from '@/lib/auth/permissions'

/**
 * POST /api/codespring/analyze
 * Analyze code using Codespring API
 */
export async function POST(request: NextRequest) {
  // Check permissions
  const permissionError = await requireAnyPermission(['courses.view', 'courses.manage'])
  if (permissionError) return permissionError

  try {
    const body = await request.json()
    const { code, language } = body

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 })
    }

    const client = getCodespringClient()
    const response = await client.analyzeCode(code, language)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to analyze code' },
        { status: response.statusCode || 500 }
      )
    }

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error('Codespring API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/codespring/health
 * Check Codespring API health
 */
export async function GET(request: NextRequest) {
  // Check permissions
  const permissionError = await requireAnyPermission([
    'courses.view',
    'courses.manage',
    'admin.view',
  ])
  if (permissionError) return permissionError

  try {
    const client = getCodespringClient()
    const response = await client.healthCheck()

    if (!response.success) {
      return NextResponse.json(
        {
          status: 'error',
          error: response.error || 'Health check failed',
        },
        { status: response.statusCode || 500 }
      )
    }

    return NextResponse.json(
      {
        status: 'healthy',
        data: response.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Codespring health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    )
  }
}
