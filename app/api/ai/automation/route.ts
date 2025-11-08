import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAutomationConfigs,
  createAutomationConfig,
  updateAutomationConfig,
  deleteAutomationConfig
} from '@/lib/ai/training-service'

// GET /api/ai/automation - List all automation configs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }
    
    const configs = await getAutomationConfigs()
    
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching automation configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation configs' },
      { status: 500 }
    )
  }
}

// POST /api/ai/automation - Create new automation config
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }
    
    const body = await request.json()
    const config = await createAutomationConfig({
      ...body,
      created_by: user.id
    })
    
    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creating automation config:', error)
    return NextResponse.json(
      { error: 'Failed to create automation config' },
      { status: 500 }
    )
  }
}

// PATCH /api/ai/automation - Update automation config
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
    }
    
    const config = await updateAutomationConfig(id, updates)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating automation config:', error)
    return NextResponse.json(
      { error: 'Failed to update automation config' },
      { status: 500 }
    )
  }
}

// DELETE /api/ai/automation?id=xxx - Delete automation config
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
    }
    
    await deleteAutomationConfig(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting automation config:', error)
    return NextResponse.json(
      { error: 'Failed to delete automation config' },
      { status: 500 }
    )
  }
}
