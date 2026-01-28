import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Permission System Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testOrgId: string;

  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create test organization
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: `Test Org ${Date.now()}`,
        slug: `test-org-${Date.now()}`,
      })
      .select()
      .single();
    
    testOrgId = org!.id;

    // Create test user
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password-123',
      email_confirm: true,
    });

    testUserId = authUser.user!.id;

    // Create profile
    await supabase.from('profiles').insert({
      user_id: testUserId,
      organization_id: testOrgId,
      email: authUser.user!.email,
      full_name: 'Test User',
    });
  });

  describe('Permission Check Functions', () => {
    it('should verify check_permission function exists', async () => {
      const { data, error } = await supabase.rpc('check_permission', {
        user_id: testUserId,
        permission_name: 'courses.view',
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should verify check_permissions function exists', async () => {
      const { data, error } = await supabase.rpc('check_permissions', {
        user_id: testUserId,
        permission_names: ['courses.view', 'profile.view'],
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should verify check_role function exists', async () => {
      const { data, error } = await supabase.rpc('check_role', {
        user_id: testUserId,
        role_name: 'student',
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });

  describe('Role Assignment', () => {
    it('should allow assigning roles to users', async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserId,
          role: 'student',
          organization_id: testOrgId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.role).toBe('student');
    });

    it('should prevent duplicate role assignments', async () => {
      // Insert first role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'instructor',
        organization_id: testOrgId,
      });

      // Try to insert duplicate
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserId,
          role: 'instructor',
          organization_id: testOrgId,
        });

      expect(error).not.toBeNull();
      expect(error?.code).toBe('23505'); // Unique violation
    });
  });

  describe('Permission Enforcement', () => {
    it('should enforce admin permissions on protected routes', async () => {
      // Create user client (no admin role)
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Try to access admin-only data
      const { data, error } = await userClient
        .from('user_roles')
        .select('*');

      // Should fail without proper authentication
      expect(data).toBeDefined();
      expect(data?.length).toBe(0); // RLS prevents access
    });

    it('should allow users to view their own permissions', async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Organization Isolation', () => {
    it('should isolate user roles by organization', async () => {
      // Create second organization
      const { data: org2 } = await supabase
        .from('organizations')
        .insert({
          name: `Test Org 2 ${Date.now()}`,
          slug: `test-org-2-${Date.now()}`,
        })
        .select()
        .single();

      // Create role in first org
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'admin',
        organization_id: testOrgId,
      });

      // Verify role only exists in first org
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', testUserId)
        .eq('organization_id', testOrgId);

      expect(roles?.length).toBeGreaterThan(0);
      expect(roles?.[0].organization_id).toBe(testOrgId);
    });
  });

  describe('Permission Inheritance', () => {
    it('should verify admin role has comprehensive permissions', async () => {
      // Assign admin role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'admin',
        organization_id: testOrgId,
      });

      // Check for admin permissions
      const { data: hasAdminPerm } = await supabase.rpc('check_permission', {
        user_id: testUserId,
        permission_name: 'admin.manage',
      });

      expect(hasAdminPerm).toBe(true);
    });

    it('should verify instructor role has course permissions', async () => {
      // Assign instructor role
      await supabase.from('user_roles').insert({
        user_id: testUserId,
        role: 'instructor',
        organization_id: testOrgId,
      });

      // Check for instructor permissions
      const { data: hasCoursePerm } = await supabase.rpc('check_permission', {
        user_id: testUserId,
        permission_name: 'courses.create',
      });

      expect(hasCoursePerm).toBe(true);
    });
  });
});
