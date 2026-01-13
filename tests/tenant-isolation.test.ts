/**
 * Tenant Isolation Test Suite
 * 
 * Tests to verify:
 * 1. Cross-tenant data access prevention
 * 2. Permission boundary enforcement
 * 3. RLS policy effectiveness
 * 4. Permission-based access control
 * 
 * Run: npm run test -- tenant-isolation.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials for testing')
}

// Service role client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// Test data
let org1Id: string
let org2Id: string
let user1Id: string // Org 1 user
let user2Id: string // Org 2 user
let user1Client: any
let user2Client: any
let testCourseOrg1: string
let testCourseOrg2: string

describe('Tenant Isolation Tests', () => {
  beforeAll(async () => {
    // Create test organizations
    const { data: orgs } = await adminClient
      .from('organizations')
      .insert([
        { name: 'Test Org 1', slug: 'test-org-1-isolation' },
        { name: 'Test Org 2', slug: 'test-org-2-isolation' }
      ])
      .select()
    
    org1Id = orgs![0].id
    org2Id = orgs![1].id
    
    // Create test users (one per org)
    const { data: { user: user1 } } = await adminClient.auth.admin.createUser({
      email: 'tenant-test-1@example.com',
      password: 'test123456',
      email_confirm: true
    })
    
    const { data: { user: user2 } } = await adminClient.auth.admin.createUser({
      email: 'tenant-test-2@example.com',
      password: 'test123456',
      email_confirm: true
    })
    
    user1Id = user1!.id
    user2Id = user2!.id
    
    // Update profiles with org assignments
    await adminClient
      .from('profiles')
      .update({ organization_id: org1Id, role: 'learner' })
      .eq('id', user1Id)
    
    await adminClient
      .from('profiles')
      .update({ organization_id: org2Id, role: 'learner' })
      .eq('id', user2Id)
    
    // Create test data in each org
    const { data: courses } = await adminClient
      .from('courses')
      .insert([
        {
          title: 'Org 1 Course',
          slug: 'org-1-course-test',
          organization_id: org1Id,
          created_by: user1Id,
          is_published: true
        },
        {
          title: 'Org 2 Course',
          slug: 'org-2-course-test',
          organization_id: org2Id,
          created_by: user2Id,
          is_published: true
        }
      ])
      .select()
    
    testCourseOrg1 = courses![0].id
    testCourseOrg2 = courses![1].id
    
    // Create user clients (with RLS)
    const { data: { session: session1 } } = await adminClient.auth.signInWithPassword({
      email: 'tenant-test-1@example.com',
      password: 'test123456'
    })
    
    const { data: { session: session2 } } = await adminClient.auth.signInWithPassword({
      email: 'tenant-test-2@example.com',
      password: 'test123456'
    })
    
    user1Client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session1!.access_token}`
        }
      }
    })
    
    user2Client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session2!.access_token}`
        }
      }
    })
  })
  
  afterAll(async () => {
    // Cleanup test data
    await adminClient.from('courses').delete().eq('organization_id', org1Id)
    await adminClient.from('courses').delete().eq('organization_id', org2Id)
    await adminClient.auth.admin.deleteUser(user1Id)
    await adminClient.auth.admin.deleteUser(user2Id)
    await adminClient.from('organizations').delete().eq('id', org1Id)
    await adminClient.from('organizations').delete().eq('id', org2Id)
  })
  
  describe('Cross-Tenant Profile Access', () => {
    it('should only see own profile', async () => {
      const { data: profiles } = await user1Client
        .from('profiles')
        .select('id')
      
      expect(profiles).toHaveLength(1)
      expect(profiles![0].id).toBe(user1Id)
    })
    
    it('should not access other org profiles', async () => {
      const { data } = await user1Client
        .from('profiles')
        .select('id')
        .eq('id', user2Id)
      
      expect(data).toHaveLength(0)
    })
  })
  
  describe('Cross-Tenant Course Access', () => {
    it('should see own org courses', async () => {
      const { data: courses } = await user1Client
        .from('courses')
        .select('id')
        .eq('id', testCourseOrg1)
      
      expect(courses).toHaveLength(1)
    })
    
    it('should see public published courses from other orgs', async () => {
      // Published courses are visible across orgs (by design)
      const { data: courses } = await user1Client
        .from('courses')
        .select('id')
        .eq('is_published', true)
      
      // Should see at least own org course
      expect(courses!.length).toBeGreaterThanOrEqual(1)
    })
    
    it('should not update other org courses', async () => {
      const { error } = await user1Client
        .from('courses')
        .update({ title: 'Hacked' })
        .eq('id', testCourseOrg2)
      
      expect(error).toBeTruthy()
    })
    
    it('should not delete other org courses', async () => {
      const { error } = await user1Client
        .from('courses')
        .delete()
        .eq('id', testCourseOrg2)
      
      expect(error).toBeTruthy()
    })
  })
  
  describe('Cross-Tenant Organization Access', () => {
    it('should only see own organization', async () => {
      const { data: orgs } = await user1Client
        .from('organizations')
        .select('id')
      
      expect(orgs).toHaveLength(1)
      expect(orgs![0].id).toBe(org1Id)
    })
    
    it('should not access other organizations', async () => {
      const { data } = await user1Client
        .from('organizations')
        .select('id')
        .eq('id', org2Id)
      
      expect(data).toHaveLength(0)
    })
    
    it('should not update other organizations', async () => {
      const { error } = await user1Client
        .from('organizations')
        .update({ name: 'Hacked Org' })
        .eq('id', org2Id)
      
      expect(error).toBeTruthy()
    })
  })
  
  describe('Enrollment Isolation', () => {
    let enrollment1: string
    let enrollment2: string
    
    beforeAll(async () => {
      // Create enrollments
      const { data } = await adminClient
        .from('enrollments')
        .insert([
          {
            user_id: user1Id,
            course_id: testCourseOrg1,
            organization_id: org1Id
          },
          {
            user_id: user2Id,
            course_id: testCourseOrg2,
            organization_id: org2Id
          }
        ])
        .select()
      
      enrollment1 = data![0].id
      enrollment2 = data![1].id
    })
    
    it('should only see own enrollments', async () => {
      const { data: enrollments } = await user1Client
        .from('enrollments')
        .select('id')
      
      expect(enrollments).toHaveLength(1)
      expect(enrollments![0].id).toBe(enrollment1)
    })
    
    it('should not access other user enrollments', async () => {
      const { data } = await user1Client
        .from('enrollments')
        .select('id')
        .eq('id', enrollment2)
      
      expect(data).toHaveLength(0)
    })
    
    it('should not update other user enrollments', async () => {
      const { error } = await user1Client
        .from('enrollments')
        .update({ status: 'completed' })
        .eq('id', enrollment2)
      
      expect(error).toBeTruthy()
    })
  })
  
  describe('Gamification Data Isolation', () => {
    let pointsOrg1: string
    let pointsOrg2: string
    
    beforeAll(async () => {
      // Create points records
      const { data } = await adminClient
        .from('user_course_points')
        .insert([
          {
            user_id: user1Id,
            course_id: testCourseOrg1,
            total_earned: 100,
            current_balance: 100
          },
          {
            user_id: user2Id,
            course_id: testCourseOrg2,
            total_earned: 200,
            current_balance: 200
          }
        ])
        .select()
      
      pointsOrg1 = data![0].id
      pointsOrg2 = data![1].id
    })
    
    it('should only see own points', async () => {
      const { data: points } = await user1Client
        .from('user_course_points')
        .select('id')
      
      expect(points).toHaveLength(1)
      expect(points![0].id).toBe(pointsOrg1)
    })
    
    it('should not access other user points', async () => {
      const { data } = await user1Client
        .from('user_course_points')
        .select('id')
        .eq('id', pointsOrg2)
      
      expect(data).toHaveLength(0)
    })
  })
  
  describe('Audit Log Isolation', () => {
    let logOrg1: string
    let logOrg2: string
    
    beforeAll(async () => {
      // Create audit logs
      const { data } = await adminClient
        .from('audit_logs')
        .insert([
          {
            user_id: user1Id,
            organization_id: org1Id,
            action: 'test_action_1',
            resource_type: 'test',
            resource_id: 'test-1'
          },
          {
            user_id: user2Id,
            organization_id: org2Id,
            action: 'test_action_2',
            resource_type: 'test',
            resource_id: 'test-2'
          }
        ])
        .select()
      
      logOrg1 = data![0].id
      logOrg2 = data![1].id
    })
    
    it('should only see own audit logs', async () => {
      const { data: logs } = await user1Client
        .from('audit_logs')
        .select('id')
      
      expect(logs).toHaveLength(1)
      expect(logs![0].id).toBe(logOrg1)
    })
    
    it('should not access other org audit logs', async () => {
      const { data } = await user1Client
        .from('audit_logs')
        .select('id')
        .eq('id', logOrg2)
      
      expect(data).toHaveLength(0)
    })
    
    it('should not modify audit logs', async () => {
      // Audit logs are immutable
      const { error } = await user1Client
        .from('audit_logs')
        .update({ action: 'modified' })
        .eq('id', logOrg1)
      
      expect(error).toBeTruthy()
    })
  })
  
  describe('Permission Check Functions', () => {
    it('should correctly identify user organization', async () => {
      const { data } = await user1Client.rpc('auth.user_organization_id')
      
      expect(data).toBe(org1Id)
    })
    
    it('should verify org membership', async () => {
      const { data: isMember } = await adminClient.rpc('auth.belongs_to_organization', {
        p_user_id: user1Id,
        p_organization_id: org1Id
      })
      
      expect(isMember).toBe(true)
    })
    
    it('should deny cross-org membership', async () => {
      const { data: isMember } = await adminClient.rpc('auth.belongs_to_organization', {
        p_user_id: user1Id,
        p_organization_id: org2Id
      })
      
      expect(isMember).toBe(false)
    })
  })
  
  describe('Service Role Bypass', () => {
    it('admin should see all organizations', async () => {
      const { data: orgs } = await adminClient
        .from('organizations')
        .select('id')
        .in('id', [org1Id, org2Id])
      
      expect(orgs).toHaveLength(2)
    })
    
    it('admin should see all profiles', async () => {
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('id')
        .in('id', [user1Id, user2Id])
      
      expect(profiles).toHaveLength(2)
    })
    
    it('admin should access all courses', async () => {
      const { data: courses } = await adminClient
        .from('courses')
        .select('id')
        .in('id', [testCourseOrg1, testCourseOrg2])
      
      expect(courses).toHaveLength(2)
    })
  })
})

describe('Permission Boundary Tests', () => {
  it('should enforce permission-based SELECT policies', async () => {
    // Learner without special permissions
    const { data } = await user1Client
      .from('tribunal_cases')
      .select('id')
      .limit(10)
    
    // Should see published cases (public access)
    expect(data).toBeDefined()
  })
  
  it('should prevent unauthorized INSERT', async () => {
    // Learner trying to import cases (needs cases.import permission)
    const { error } = await user1Client
      .from('tribunal_cases')
      .insert({
        title: 'Test Case',
        case_number: 'TEST-001',
        organization_id: org1Id
      })
    
    expect(error).toBeTruthy()
  })
  
  it('should prevent unauthorized UPDATE', async () => {
    const { error } = await user1Client
      .from('courses')
      .update({ title: 'Modified' })
      .eq('id', testCourseOrg1)
    
    // Learner can't update courses without permission
    expect(error).toBeTruthy()
  })
  
  it('should prevent unauthorized DELETE', async () => {
    const { error } = await user1Client
      .from('courses')
      .delete()
      .eq('id', testCourseOrg1)
    
    // Learner can't delete courses
    expect(error).toBeTruthy()
  })
})

describe('RLS Policy Verification', () => {
  it('should have RLS enabled on critical tables', async () => {
    const criticalTables = [
      'profiles',
      'organizations',
      'user_roles',
      'courses',
      'lessons',
      'tribunal_cases',
      'quizzes',
      'certificates',
      'audit_logs',
      'ai_usage_logs'
    ]
    
    for (const table of criticalTables) {
      const { data } = await adminClient
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', table)
        .single()
      
      expect(data?.rowsecurity).toBe(true)
    }
  })
  
  it('should have permission-based policies', async () => {
    const { data: policies } = await adminClient
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'public')
      .in('tablename', ['courses', 'lessons', 'quizzes'])
    
    // Should have service role bypass policies
    const bypassPolicies = policies?.filter(p => 
      p.policyname.includes('.*_bypass')
    )
    
    expect(bypassPolicies!.length).toBeGreaterThan(0)
  })
})
