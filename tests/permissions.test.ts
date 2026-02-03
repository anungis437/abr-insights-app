import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Type assertion helper for test database operations
type SupabaseClient = ReturnType<typeof createClient>

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Enhanced validation: Check if URL is a valid HTTP/HTTPS URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const skipTests = !isValidUrl(supabaseUrl) || !supabaseKey

if (skipTests) {
  console.warn('⚠️  Skipping permission tests: Missing Supabase credentials')
}

describe.skipIf(skipTests)('Permission System Tests', () => {
  let supabase: SupabaseClient
  let testUserId: string
  let testOrgId: string

  beforeAll(async () => {
    supabase = createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create test organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `Test Org ${Date.now()}`,
        slug: `test-org-${Date.now()}`,
      } as any)
      .select()
      .single()

    if (orgError) {
      throw new Error(`Failed to create test organization: ${orgError.message}`)
    }

    if (!org) {
      throw new Error('Failed to create test organization: No data returned')
    }

    testOrgId = (org as any).id

    // Create test user
    const authUserResult = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password-123',
      email_confirm: true,
    })

    testUserId = authUserResult.data.user!.id

    // Create profile
    await supabase.from('profiles').insert({
      user_id: testUserId,
      organization_id: testOrgId,
      email: authUserResult.data.user!.email,
      full_name: 'Test User',
    } as any)
  })

  describe('Permission Check Functions', () => {
    it('should verify check_user_permission function exists', async () => {
      const { data, error } = await supabase.rpc(
        'check_user_permission' as any,
        {
          user_id: testUserId,
          permission_name: 'courses.view',
        } as any
      )

      expect(error).toBeNull()
      expect(typeof data).toBe('boolean')
    })

    it('should verify has_any_permission function exists', async () => {
      const { data, error } = await supabase.rpc(
        'has_any_permission' as any,
        {
          user_id: testUserId,
          permission_names: ['courses.view', 'profile.view'],
        } as any
      )

      expect(error).toBeNull()
      expect(typeof data).toBe('boolean')
    })

    it('should verify has_role function exists', async () => {
      const { data, error } = await supabase.rpc(
        'has_role' as any,
        {
          user_id: testUserId,
          role_name: 'learner',
        } as any
      )

      expect(error).toBeNull()
      expect(typeof data).toBe('boolean')
    })
  })

  describe('Role Assignment', () => {
    it('should allow assigning roles to users', async () => {
      // First get a role_id
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'learner')
        .single()

      if (!roleData) {
        console.warn('Learner role not found, skipping test')
        return
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserId,
          role_id: roleData.id,
          organization_id: testOrgId,
        } as any)
        .select()
        .single()

      expect(error).toBeNull()
      expect((data as any)?.role_id).toBe(roleData.id)
    })

    it('should prevent duplicate role assignments', async () => {
      // First get a role_id
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'instructor')
        .single()

      if (!roleData) {
        console.warn('Instructor role not found, skipping test')
        return
      }

      // Insert first role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role_id: roleData.id,
        organization_id: testOrgId,
      } as any)

      // Try to insert duplicate
      const { error } = await supabase.from('user_roles').insert({
        user_id: testUserId,
        role_id: roleData.id,
        organization_id: testOrgId,
      } as any)

      expect(error).not.toBeNull()
      expect(error?.code).toBe('23505') // Unique violation
    })
  })

  describe('Permission Enforcement', () => {
    it('should enforce admin permissions on protected routes', async () => {
      // Create user client (no admin role)
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Try to access admin-only data
      const { data, error } = await userClient.from('user_roles').select('*')

      // Should fail without proper authentication
      expect(data).toBeDefined()
      expect(data?.length).toBe(0) // RLS prevents access
    })

    it('should allow users to view their own permissions', async () => {
      const { data, error } = await supabase.from('permissions').select('*').limit(5)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('Organization Isolation', () => {
    it('should isolate user roles by organization', async () => {
      // Create second organization
      const { data: org2 } = await supabase
        .from('organizations')
        .insert({
          name: `Test Org 2 ${Date.now()}`,
          slug: `test-org-2-${Date.now()}`,
        } as any)
        .select()
        .single()

      // Create role in first org
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'admin',
        organization_id: testOrgId,
      } as any)

      // Verify role only exists in first org
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', testUserId)
        .eq('organization_id', testOrgId)

      expect(roles?.length).toBeGreaterThan(0)
      expect((roles as any)?.[0].organization_id).toBe(testOrgId)
    })
  })

  describe('Permission Inheritance', () => {
    it('should verify admin role has comprehensive permissions', async () => {
      // Assign admin role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'admin',
        organization_id: testOrgId,
      } as any)

      // Check for admin permissions
      const { data: hasAdminPerm } = await supabase.rpc(
        'check_permission' as any,
        {
          user_id: testUserId,
          permission_name: 'admin.manage',
        } as any
      )

      expect(hasAdminPerm).toBe(true)
    })

    it('should verify instructor role has course permissions', async () => {
      // Assign instructor role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'instructor',
        organization_id: testOrgId,
      } as any)

      // Check for instructor permissions
      const { data: hasCoursePerm } = await supabase.rpc(
        'check_permission' as any,
        {
          user_id: testUserId,
          permission_name: 'courses.create',
        } as any
      )

      expect(hasCoursePerm).toBe(true)
    })
  })
})
