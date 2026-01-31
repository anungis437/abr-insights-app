// API route for role permissions management
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'
import { logger } from '@/lib/utils/production-logger'

// GET /api/admin/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    // Check permissions - requires roles.view or roles.manage
    const check = await requireAnyPermission(['roles.view', 'roles.manage'])
    if (check instanceof NextResponse) {
      return check // Return 403 response
    }

    const supabase = await createClient()

    // Get query params
    const { searchParams } = new URL(request.url)
    const include_permissions = searchParams.get('include_permissions') === 'true'

    // Fetch roles
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: true })

    if (error) {
      logger.error('Failed to fetch roles', error as Error)
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
            permissions: rolePerms?.map((rp) => rp.permissions).filter(Boolean) || [],
          }
        })
      )

      return NextResponse.json({ roles: rolesWithPermissions })
    }

    return NextResponse.json({ roles })
  } catch (error) {
    logger.error('Roles API request failed', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles - Create new role (super_admin only)
export async function POST(request: NextRequest) {
  // Check permissions
  const permissionError = await requireAnyPermission(['roles.create', 'roles.manage'])
  if (permissionError) return permissionError

  try {
    const supabase = await createClient()

    const body = await request.json()
    const { name, slug, description, level, is_system } = body

    // Validate required fields
    if (!name || !slug || level === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, slug, level',
        },
        { status: 400 }
      )
    }

    // Insert role
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        slug,
        description: description || null,
        level,
        is_system: is_system || false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create role', error as Error, {
        name,
        slug,
        level,
        errorMessage: error.message,
      })
      return NextResponse.json(
        {
          error: 'Failed to create role',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    logger.error('Role creation API request failed', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
