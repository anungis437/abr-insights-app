/**
 * Tests for SAML Logout Route  
 * @route POST /api/auth/saml/logout
 * @route GET /api/auth/saml/logout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock dependencies
vi.mock('@/lib/supabase/server')
vi.mock('next/headers')

describe('POST /api/auth/saml/logout', () => {
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
    it('should successfully logout user locally', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      
      // Verify RPC was called
      expect(mockSupabase.rpc).toHaveBeenCalledWith('revoke_user_sso_sessions', {
        p_user_id: 'user-123',
      })
      
      // Verify sign out was called
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should allow logout when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockSupabase.rpc).not.toHaveBeenCalled()
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled()
    })

    it('should handle empty request body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })
  })

  describe('Successful Single Logout', () => {
    it('should return SLO URL when single logout is requested', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-123' }, error: null }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { saml_slo_url: 'https://idp.example.com/slo' },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: true,
          organization_slug: 'test-org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        slo_url: 'https://idp.example.com/slo',
      })
    })

    it('should fallback to local logout when SLO URL is not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-123' }, error: null }),
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

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: true,
          organization_slug: 'test-org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })

    it('should handle organization not found for single logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: true,
          organization_slug: 'invalid-org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })
  })

  describe('Exception Handling', () => {
    it('should handle RPC errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockRejectedValue(new Error('RPC failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Logout failed',
        details: 'RPC failed',
      })
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Logout failed',
        details: 'Sign out failed',
      })
    })

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Logout failed',
        details: 'Unknown error',
      })
    })

    it('should handle invalid JSON in request body', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })

    it('should handle getUser errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })
  })

  describe('Edge Cases', () => {
    it('should handle explicit false single_logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: false,
          organization_slug: 'test-org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle missing organization_slug with single_logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: true,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle null saml_slo_url from provider', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-123' }, error: null }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { saml_slo_url: null },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout', {
        method: 'POST',
        body: JSON.stringify({
          single_logout: true,
          organization_slug: 'test-org',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })
  })
})

describe('GET /api/auth/saml/logout', () => {
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
    it('should redirect to login after local logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should logout and redirect even when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(mockSupabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('Successful Single Logout', () => {
    it('should redirect to IdP SLO URL when single logout is requested', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-123' }, error: null }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { saml_slo_url: 'https://idp.example.com/slo' },
              error: null,
            }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/logout?single_logout=true&org=test-org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('https://idp.example.com/slo')
    })

    it('should fallback to login when SLO URL is not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-123' }, error: null }),
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

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/logout?single_logout=true&org=test-org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
    })
  })

  describe('Exception Handling', () => {
    it('should redirect to login with error on exception', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=logout_failed')
    })

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.getUser.mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/saml/logout')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=logout_failed')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single_logout=false', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/logout?single_logout=false&org=test-org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle missing org parameter with single_logout', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/logout?single_logout=true'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })
})
