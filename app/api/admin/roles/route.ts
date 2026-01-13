// API route for role permissions management
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check permissions
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
    const include_permissions = searchParams.get('include_permissions') === 'true'
    
    // Fetch roles
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: true })
    
    if (error) {
      console.error('Error fetching roles:', error)
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
    }
    
    // Optionally include permissions for each role
    if (include_permissions && roles) {
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const { data: rolePerms } = await supabase
            .from('role_permissions')
            .select('permission_id, permissions(id, slug, name, resource, action)')
            .eq('role_id', role.id)
          
          return {
            ...role,
            permissions: rolePerms?.map(rp => rp.permissions).filter(Boolean) || []
          }
        })
      )
      
      return NextResponse.json({ roles: rolesWithPermissions })
    }
    
    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Roles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles - Create new role (super_admin only)
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
    const { name, slug, description, level, is_system } = body
    
    // Validate required fields
    if (!name || !slug || level === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, slug, level' 
      }, { status: 400 })
    }
    
    // Insert role
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        slug,
        description: description || null,
        level,
        is_system: is_system || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating role:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to create role' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error('Roles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
