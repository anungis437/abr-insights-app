/**
 * Tests for Azure AD Logout Route
 * @route POST /api/auth/azure/logout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock dependencies
vi.mock('@/lib/supabase/server')

describe('POST /api/auth/azure/logout', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('Successful Local Logout', () => {
    it('should successfully logout user with local logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.redirectUrl).toBe('/login')
      expect(data.message).toBe('Logged out successfully')
      expect(mockSupabase.rpc).toHaveBeenCalledWith('revoke_user_sso_sessions', {
        p_user_id: 'user-123',
        p_reason: 'user_logout',
      })
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should logout with custom return URL', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: '/custom-page' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.redirectUrl).toBe('/custom-page')
    })

    it('should revoke SSO sessions before signing out', async () => {
      const userId = 'user-456'

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-456', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      await POST(request)

      // Verify both methods were called
      expect(mockSupabase.rpc).toHaveBeenCalledWith('revoke_user_sso_sessions', {
        p_user_id: userId,
        p_reason: 'user_logout',
      })
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('Successful Single Logout', () => {
    it('should return Azure AD logout URL for single logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { organization_id: 'org-123', metadata: {} },
              error: null,
            }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                azure_tenant_id: 'contoso',
                azure_policy_name: 'B2C_1_signupsignin1',
              },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({ singleLogout: true }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.logoutUrl).toContain('contoso.b2clogin.com')
      expect(data.logoutUrl).toContain('B2C_1_signupsignin1')
      expect(data.logoutUrl).toContain('logout')
      expect(data.message).toBe('SSO session revoked. Redirect to Azure AD logout.')
    })

    it('should include custom return URL in Azure AD logout URL', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { organization_id: 'org-123', metadata: {} },
              error: null,
            }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                azure_tenant_id: 'contoso',
                azure_policy_name: 'B2C_1_custom',
              },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({
          singleLogout: true,
          returnUrl: 'http://localhost:3000/goodbye',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.logoutUrl).toContain(encodeURIComponent('http://localhost:3000/goodbye'))
    })

    it('should fallback to local logout when SSO provider not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { organization_id: 'org-123', metadata: {} },
              error: null,
            }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({ singleLogout: true }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.redirectUrl).toBe('/login')
      expect(data.logoutUrl).toBeUndefined()
    })
  })

  describe('Authentication Errors', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should return 401 when getUser returns error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })
  })

  describe('Profile Errors', () => {
    it('should return 404 when profile is not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Profile not found')
    })
  })

  describe('Exception Handling', () => {
    it('should handle RPC errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockRejectedValue(new Error('RPC connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Logout failed')
      expect(data.details).toBe('RPC connection failed')
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Logout failed')
      expect(data.details).toBe('Sign out failed')
    })

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Logout failed')
      expect(data.details).toBe('Unknown error')
    })

    it('should handle malformed JSON request body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      // Should handle JSON parse error and default to empty body
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should use default policy when azure_policy_name is not set', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { organization_id: 'org-123', metadata: {} },
              error: null,
            }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                azure_tenant_id: 'contoso',
                azure_policy_name: null,
              },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({ singleLogout: true }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.logoutUrl).toContain('B2C_1_signupsignin1')
    })

    it('should handle singleLogout=false explicitly', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: 'org-123', metadata: {} },
          error: null,
        }),
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/azure/logout', {
        method: 'POST',
        body: JSON.stringify({ singleLogout: false }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.redirectUrl).toBe('/login')
      expect(data.logoutUrl).toBeUndefined()
    })
  })
})
