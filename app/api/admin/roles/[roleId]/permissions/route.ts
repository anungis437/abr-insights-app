// API route for assigning permissions to roles
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/roles/[roleId]/permissions - Get permissions for a role
export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
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
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['super_admin', 'org_admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { roleId } = params
    
    // Get role permissions
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select(`
        id,
        permission_id,
        created_at,
        permissions (
          id,
          slug,
          name,
          description,
          resource,
          action,
          is_system
        )
      `)
      .eq('role_id', roleId)
    
    if (error) {
      console.error('Error fetching role permissions:', error)
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      role_permissions: rolePermissions || [],
      permissions: rolePermissions?.map(rp => rp.permissions).filter(Boolean) || []
    })
  } catch (error) {
    console.error('Role permissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles/[roleId]/permissions - Assign permission to role
export async function POST(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
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
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['super_admin', 'org_admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { roleId } = params
    const body = await request.json()
    const { permission_id, permission_ids } = body
    
    // Support both single and bulk assignment
    const permissionIds = permission_ids || (permission_id ? [permission_id] : [])
    
    if (permissionIds.length === 0) {
      return NextResponse.json({ 
        error: 'Missing permission_id or permission_ids' 
      }, { status: 400 })
    }
    
    // Insert role permissions (ignore conflicts)
    const inserts = permissionIds.map((permId: string) => ({
      role_id: roleId,
      permission_id: permId
    }))
    
    const { data, error } = await supabase
      .from('role_permissions')
      .upsert(inserts, { onConflict: 'role_id,permission_id', ignoreDuplicates: true })
      .select()
    
    if (error) {
      console.error('Error assigning permissions:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to assign permissions' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      role_permissions: data,
      assigned: data?.length || 0
    }, { status: 201 })
  } catch (error) {
    console.error('Role permissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/roles/[roleId]/permissions - Remove permission from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
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
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['super_admin', 'org_admin'].includes(profile.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { roleId } = params
    const { searchParams } = new URL(request.url)
    const permission_id = searchParams.get('permission_id')
    
    if (!permission_id) {
      return NextResponse.json({ 
        error: 'Missing permission_id query parameter' 
      }, { status: 400 })
    }
    
    // Delete role permission
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permission_id)
    
    if (error) {
      console.error('Error removing permission:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to remove permission' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Role permissions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
