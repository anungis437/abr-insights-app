import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage'])
  if (permissionError) return permissionError

  try {
    const supabase = await createClient()

    // Get model performance metrics
    const { data, error } = await supabase.rpc('get_model_performance_metrics')

    if (error) throw error

    return NextResponse.json({
      metrics: data || [],
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching model performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model performance metrics' },
      { status: 500 }
    )
  }
}
