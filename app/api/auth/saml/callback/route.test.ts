/**
 * Tests for SAML Callback Route  
 * @route POST /api/auth/saml/callback
 * @route GET /api/auth/saml/callback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock dependencies
vi.mock('@/lib/auth/saml')
vi.mock('@/lib/supabase/server')
vi.mock('next/headers')

describe('POST /api/auth/saml/callback', () => {
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

  const mockSAMLService = {
    validateResponse: vi.fn(),
    provisionUser: vi.fn(),
    createSession: vi.fn(),
    logLoginAttempt: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    vi.mocked(getSAMLService).mockResolvedValue(mockSAMLService as any)
  })

  describe('Successful Authentication', () => {
    it('should successfully authenticate and redirect to dashboard', async () => {
      const samlResponse = 'base64_encoded_saml_response'
      const relayState = JSON.stringify({
        organizationSlug: 'acme-corp',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      const mockAttributes = {
        nameID: 'user-123@example.com',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
      }

      mockSAMLService.validateResponse.mockResolvedValue(mockAttributes)
      mockSAMLService.provisionUser.mockResolvedValue('user-id-123')

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      })

      const formData = new FormData()
      formData.append('SAMLResponse', samlResponse)
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/dashboard')
      expect(mockCookieStore.delete).toHaveBeenCalledWith('saml_relay_state')
      expect(mockSAMLService.logLoginAttempt).toHaveBeenCalledWith(
        'org-123',
        'sso-123',
        'success',
        mockAttributes,
        'user-id-123',
        expect.any(String),
        expect.any(String)
      )
    })

    it('should provision new user on first SAML login', async () => {
      const samlResponse = 'base64_encoded_saml_response'
      const relayState = JSON.stringify({
        organizationSlug: 'new-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      const mockAttributes = {
        nameID: 'newuser@example.com',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      }

      mockSAMLService.validateResponse.mockResolvedValue(mockAttributes)
      mockSAMLService.provisionUser.mockResolvedValue('new-user-id-456')

      mockSupabase.auth.admin.updateUserById.mockResolvedValue({
        data: {},
        error: null,
      })

      const formData = new FormData()
      formData.append('SAMLResponse', samlResponse)
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(mockSAMLService.provisionUser).toHaveBeenCalledWith(mockAttributes, 'org-456')
      expect(mockSAMLService.createSession).toHaveBeenCalled()
    })

    it('should extract client IP from headers', async () => {
      const samlResponse = 'base64_encoded_saml_response'
      const relayState = JSON.stringify({
        organizationSlug: 'acme-corp',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      mockSAMLService.validateResponse.mockResolvedValue({
        nameID: 'user@example.com',
        email: 'user@example.com',
      })

      mockSAMLService.provisionUser.mockResolvedValue('user-id-123')
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null })

      const formData = new FormData()
      formData.append('SAMLResponse', samlResponse)
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
          'user-agent': 'Mozilla/5.0',
        },
      })

      await POST(request)

      expect(mockSAMLService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.100, 10.0.0.1',
          userAgent: 'Mozilla/5.0',
        })
      )
    })

    it('should update user metadata with SAML information', async () => {
      const samlResponse = 'base64_encoded_saml_response'
      const relayState = JSON.stringify({
        organizationSlug: 'acme-corp',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      const mockAttributes = {
        nameID: 'user@example.com',
        email: 'user@example.com',
      }

      mockSAMLService.validateResponse.mockResolvedValue(mockAttributes)
      mockSAMLService.provisionUser.mockResolvedValue('user-id-123')
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null })

      const formData = new FormData()
      formData.append('SAMLResponse', samlResponse)
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      await POST(request)

      expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-id-123',
        expect.objectContaining({
          user_metadata: expect.objectContaining({
            sso_provider: 'saml',
            saml_name_id: 'user@example.com',
            organization_id: 'org-123',
            organization_slug: 'acme-corp',
          }),
        })
      )
    })
  })

  describe('Validation Errors', () => {
    it('should redirect when SAMLResponse is missing', async () => {
      const formData = new FormData()
      formData.append('RelayState', 'test')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_saml_response')
    })

    it('should redirect when relay state does not match', async () => {
      const relayState = JSON.stringify({ organizationSlug: 'test', timestamp: Date.now() })

      mockCookieStore.get.mockReturnValue({ value: 'different_relay_state' })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=invalid_relay_state')
    })

    it('should redirect when stored relay state cookie is missing', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', 'state')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=invalid_relay_state')
    })

    it('should redirect when organization slug is missing from relay state', async () => {
      const relayState = JSON.stringify({ timestamp: Date.now() })

      mockCookieStore.get.mockReturnValue({ value: relayState })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })

    it('should redirect when organization is not found', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'invalid-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('Organization%20not%20found')
    })

    it('should redirect when SSO provider is not found', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      mockSAMLService.validateResponse.mockResolvedValue({
        nameID: 'user@example.com',
        email: 'user@example.com',
      })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('SSO%20provider%20not%20found')
    })
  })

  describe('SAML Validation Errors', () => {
    it('should redirect when SAML response validation fails', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

      mockSAMLService.validateResponse.mockRejectedValue(
        new Error('Invalid SAML signature')
      )

      const formData = new FormData()
      formData.append('SAMLResponse', 'invalid_response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('Invalid%20SAML%20signature')
    })

    it('should redirect when SAML assertion is expired', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

      mockSAMLService.validateResponse.mockRejectedValue(
        new Error('SAML assertion expired')
      )

      const formData = new FormData()
      formData.append('SAMLResponse', 'expired_response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('SAML%20assertion%20expired')
    })
  })

  describe('Provisioning Errors', () => {
    it('should redirect when user provisioning fails', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      mockSAMLService.validateResponse.mockResolvedValue({
        nameID: 'user@example.com',
        email: 'user@example.com',
      })

      mockSAMLService.provisionUser.mockRejectedValue(
        new Error('User account disabled')
      )

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('User%20account%20disabled')
    })

    it('should log failed login attempt when provisioning fails', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      mockSAMLService.validateResponse.mockResolvedValue({
        nameID: 'user@example.com',
        email: 'user@example.com',
      })

      mockSAMLService.provisionUser.mockRejectedValue(new Error('Provisioning failed'))

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      await POST(request)

      expect(mockSAMLService.logLoginAttempt).toHaveBeenCalledWith(
        'org-123',
        'sso-123',
        'error',
        undefined,
        undefined,
        expect.any(String),
        expect.any(String),
        'Provisioning failed',
        'SAML_VALIDATION_ERROR'
      )
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

      mockSupabase.from.mockImplementation(() => {
        throw 'String error'
      })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('Unknown%20error')
    })

    it('should handle invalid JSON in relay state', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'invalid_json' })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', 'invalid_json')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=saml_error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle sessionIndex in relay state', async () => {
      const relayState = JSON.stringify({
        organizationSlug: 'test-org',
        timestamp: Date.now(),
        sessionIndex: 'session-index-123',
      })

      mockCookieStore.get.mockReturnValue({ value: relayState })

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

      mockSAMLService.validateResponse.mockResolvedValue({
        nameID: 'user@example.com',
        email: 'user@example.com',
      })

      mockSAMLService.provisionUser.mockResolvedValue('user-id-123')
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: {}, error: null })

      const formData = new FormData()
      formData.append('SAMLResponse', 'response')
      formData.append('RelayState', relayState)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/callback', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)

      expect(response.status).toBe(307)
      expect(mockSAMLService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionIndex: 'session-index-123',
        })
      )
    })
  })
})

describe('GET /api/auth/saml/callback', () => {
  it('should redirect to login with error for GET requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/saml/callback')

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login?error=use_post_binding')
  })
})
