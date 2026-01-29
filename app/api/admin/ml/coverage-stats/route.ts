import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage'])
  if (permissionError) return permissionError

  try {
    const supabase = await createClient()

    // Call the database function to get embedding coverage statistics
    const { data, error } = await supabase.rpc('get_embedding_coverage_stats')

    if (error) {
      throw error
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
      overall: {
        total: 0,
        embedded: 0,
        coverage: 0,
      },
    }

    // Process the database results
    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.content_type === 'case') {
          stats.cases.total = row.total_content || 0
          stats.cases.embedded = row.embedded_content || 0
          stats.cases.coverage = row.coverage_percentage || 0
        } else if (row.content_type === 'course') {
          stats.courses.total = row.total_content || 0
          stats.courses.embedded = row.embedded_content || 0
          stats.courses.coverage = row.coverage_percentage || 0
        }
      })

      // Calculate overall stats
      stats.overall.total = stats.cases.total + stats.courses.total
      stats.overall.embedded = stats.cases.embedded + stats.courses.embedded
      stats.overall.coverage =
        stats.overall.total > 0
          ? Math.round((stats.overall.embedded / stats.overall.total) * 100)
          : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching embedding coverage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch embedding coverage statistics' },
      { status: 500 }
    )
  }
}
