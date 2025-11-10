/**
 * Tests for Azure AD Callback Route
 * @route GET /api/auth/azure/callback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'
import { getAzureADService } from '@/lib/auth/azure-ad'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock dependencies
vi.mock('@/lib/auth/azure-ad')
vi.mock('@/lib/supabase/server')
vi.mock('next/headers')

describe('GET /api/auth/azure/callback', () => {
  const mockCookieStore = {
    get: vi.fn(),
    delete: vi.fn(),
  }

  const mockSupabase = {
    from: vi.fn(),
    auth: {
      admin: {
        updateUserById: vi.fn(),
      },
    },
  }

  const mockAzureADService = {
    acquireTokenByCode: vi.fn(),
    validateIdToken: vi.fn(),
    provisionUser: vi.fn(),
    createSession: vi.fn(),
    logLoginAttempt: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    vi.mocked(getAzureADService).mockResolvedValue(mockAzureADService as any)
  })

  describe('Successful Authentication', () => {
    it('should successfully authenticate and redirect to dashboard', async () => {
      const code = 'auth_code_123'
      const state = 'state_value|acme-corp'
      
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_123',
        accessToken: 'access_token_123',
      })

      mockAzureADService.validateIdToken.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      })

      mockAzureADService.provisionUser.mockResolvedValue('user-id-123')

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      })

      const request = new NextRequest(
        `http://localhost:3000/api/auth/azure/callback?code=${code}&state=${state}`
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/dashboard')
      expect(mockCookieStore.delete).toHaveBeenCalledWith('azure_ad_state')
      expect(mockAzureADService.logLoginAttempt).toHaveBeenCalledWith(
        'org-123',
        'sso-123',
        'success',
        expect.any(Object),
        'user-id-123',
        expect.any(String),
        expect.any(String)
      )
    })

    it('should provision new user on first login', async () => {
      const code = 'auth_code_123'
      const state = 'state_value|new-org'
      
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'org-456' }, error: null }),
          }
        }
        if (table === 'sso_providers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-456' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_456',
        accessToken: 'access_token_456',
      })

      const mockClaims = {
        sub: 'new-user-456',
        email: 'newuser@example.com',
        name: 'New User',
      }

      mockAzureADService.validateIdToken.mockReturnValue(mockClaims)
      mockAzureADService.provisionUser.mockResolvedValue('new-user-id-456')

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      })

      const request = new NextRequest(
        `http://localhost:3000/api/auth/azure/callback?code=${code}&state=${state}`
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(mockAzureADService.provisionUser).toHaveBeenCalledWith(mockClaims, 'org-456')
      expect(mockAzureADService.createSession).toHaveBeenCalled()
    })

    it('should extract client IP from x-forwarded-for header', async () => {
      const code = 'auth_code_123'
      const state = 'state_value|acme-corp'
      
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_123',
      })

      mockAzureADService.validateIdToken.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
      })

      mockAzureADService.provisionUser.mockResolvedValue('user-id-123')
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null })

      const request = new NextRequest(
        `http://localhost:3000/api/auth/azure/callback?code=${code}&state=${state}`,
        {
          headers: {
            'x-forwarded-for': '192.168.1.100, 10.0.0.1',
            'user-agent': 'Mozilla/5.0',
          },
        }
      )

      await GET(request)

      expect(mockAzureADService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
        })
      )
    })
  })

  describe('Azure AD Errors', () => {
    it('should redirect to login when Azure AD returns error', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?error=access_denied&error_description=User+cancelled'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=access_denied')
      expect(location).toContain('User%20cancelled')
    })

    it('should handle Azure AD error without description', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?error=server_error'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=server_error')
    })
  })

  describe('Validation Errors', () => {
    it('should redirect when code parameter is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?state=test_state'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_parameters')
    })

    it('should redirect when state parameter is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_parameters')
    })

    it('should redirect when state does not match stored state', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'stored_state' })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=different_state|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=invalid_state')
    })

    it('should redirect when stored state cookie is missing', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=test_state|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=invalid_state')
    })

    it('should redirect when organization slug is missing from state', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })

    it('should redirect when organization is not found', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|invalid-org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=invalid_organization')
    })
  })

  describe('Token Exchange Errors', () => {
    it('should redirect when token exchange fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockRejectedValue(
        new Error('Invalid authorization code')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=invalid_code&state=state_value|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=provisioning_failed')
      expect(location).toContain('Invalid%20authorization%20code')
    })

    it('should redirect when ID token validation fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'invalid_token',
      })

      mockAzureADService.validateIdToken.mockImplementation(() => {
        throw new Error('Invalid token signature')
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=provisioning_failed')
      expect(location).toContain('Invalid%20token%20signature')
    })
  })

  describe('Provisioning Errors', () => {
    it('should redirect when SSO provider is not found', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_123',
      })

      mockAzureADService.validateIdToken.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=provisioning_failed')
      expect(location).toContain('SSO%20provider%20not%20found')
    })

    it('should redirect when user provisioning fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_123',
      })

      mockAzureADService.validateIdToken.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
      })

      mockAzureADService.provisionUser.mockRejectedValue(
        new Error('Email already registered')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=provisioning_failed')
      expect(location).toContain('Email%20already%20registered')
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
      mockSupabase.from.mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=callback_error')
      expect(location).toContain('Unknown%20error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle state with multiple pipe separators', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org-with|pipes'
      )

      const response = await GET(request)

      // Should extract 'org-with' as the organization slug (first part after split)
      expect(response.status).toBe(307)
    })

    it('should continue when auth metadata update fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'state_value' })
      
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
            single: vi.fn().mockResolvedValue({ data: { id: 'sso-123' }, error: null }),
          }
        }
        return { select: vi.fn().mockReturnThis() }
      })

      mockAzureADService.acquireTokenByCode.mockResolvedValue({
        idToken: 'id_token_123',
      })

      mockAzureADService.validateIdToken.mockReturnValue({
        sub: 'user-123',
        email: 'user@example.com',
      })

      mockAzureADService.provisionUser.mockResolvedValue('user-id-123')

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: null,
        error: { message: 'Metadata update failed' },
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/azure/callback?code=auth_code&state=state_value|org'
      )

      const response = await GET(request)

      // Should still redirect to dashboard despite metadata update failure
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/dashboard')
    })
  })
})
