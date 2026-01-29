import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'

export async function GET() {
  // Check permissions
  const permissionError = await requireAnyPermission(['ai.view', 'ai.manage', 'admin.ai.manage'])
  if (permissionError) return permissionError

  try {
    const supabase = await createClient()

    // Get recent embedding jobs
    const { data: jobs, error } = await supabase
      .from('embedding_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Get job statistics
    const { data: stats, error: statsError } = await supabase.rpc('get_embedding_job_stats')

    if (statsError) throw statsError

    return NextResponse.json({
      jobs: jobs || [],
      stats: stats || {},
    })
  } catch (error) {
    console.error('Error fetching embedding jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch embedding jobs' }, { status: 500 })
  }
}
