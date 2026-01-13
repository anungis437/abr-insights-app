// API route for permissions management
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/permissions - List all permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check permissions - must be admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['super_admin', 'org_admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const resource = searchParams.get('resource')
    const system_only = searchParams.get('system_only')
    
    // Build query
    let query = supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('name', { ascending: true })
    
    if (resource) {
      query = query.eq('resource', resource)
    }
    
    if (system_only === 'true') {
      query = query.eq('is_system', true)
    }
    
    const { data: permissions, error } = await query
    
    if (error) {
      console.error('Error fetching permissions:', error)
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }
    
    // Filter by category if needed (client-side categorization)
    let filteredPermissions = permissions || []
    if (category) {
      filteredPermissions = permissions?.filter(p => {
        const pResource = p.resource.toLowerCase()
        return category === pResource || 
               (category === 'courses' && ['courses', 'lessons', 'quizzes', 'certificates', 'ce_credits'].includes(pResource))
      }) || []
    }
    
    return NextResponse.json({ permissions: filteredPermissions })
  } catch (error) {
    console.error('Permissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/permissions - Create new permission (super_admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check permissions - must be super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, slug, resource, action, description, is_system } = body
    
    // Validate required fields
    if (!name || !slug || !resource || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, slug, resource, action' 
      }, { status: 400 })
    }
    
    // Insert permission
    const { data: permission, error } = await supabase
      .from('permissions')
      .insert({
        name,
        slug,
        resource,
        action,
        description: description || null,
        is_system: is_system || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating permission:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to create permission' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ permission }, { status: 201 })
  } catch (error) {
    console.error('Permissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
