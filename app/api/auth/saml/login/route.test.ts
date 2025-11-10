/**
 * Tests for SAML Login Route
 * @route POST /api/auth/saml/login
 * @route GET /api/auth/saml/login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'
import { cookies } from 'next/headers'

// Mock dependencies
vi.mock('@/lib/auth/saml')
vi.mock('next/headers')

describe('POST /api/auth/saml/login', () => {
  const mockCookieStore = {
    set: vi.fn(),
  }

  const mockSAMLService = {
    getAuthorizationUrl: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(getSAMLService).mockResolvedValue(mockSAMLService as any)
  })

  describe('Successful Login Initiation', () => {
    it('should return SAML authorization URL for valid organization', async () => {
      const mockAuthUrl = 'https://idp.example.com/saml/sso'

      mockSAMLService.getAuthorizationUrl.mockResolvedValue(mockAuthUrl)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'acme-corp' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authUrl).toBe(mockAuthUrl)
      expect(data.organizationSlug).toBe('acme-corp')
    })

    it('should store relay state in cookie', async () => {
      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      await POST(request)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'saml_relay_state',
        expect.stringContaining('test-org'),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 600,
          path: '/',
        })
      )

      // Verify relay state is valid JSON
      const relayStateCall = mockCookieStore.set.mock.calls[0]
      const relayState = JSON.parse(relayStateCall[1])
      expect(relayState.organizationSlug).toBe('test-org')
      expect(relayState.timestamp).toBeGreaterThan(0)
    })

    it('should pass relay state to SAML service', async () => {
      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'relay-test' }),
      })

      await POST(request)

      expect(mockSAMLService.getAuthorizationUrl).toHaveBeenCalledWith({
        RelayState: expect.stringContaining('relay-test'),
      })

      const callArg = mockSAMLService.getAuthorizationUrl.mock.calls[0][0]
      const relayState = JSON.parse(callArg.RelayState)
      expect(relayState.organizationSlug).toBe('relay-test')
    })

    it('should generate unique relay state for each request', async () => {
      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request1 = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'org1' }),
      })

      const request2 = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'org2' }),
      })

      await POST(request1)
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await POST(request2)

      const calls = mockCookieStore.set.mock.calls
      const relayState1 = JSON.parse(calls[0][1])
      const relayState2 = JSON.parse(calls[1][1])

      expect(relayState1.timestamp).not.toBe(relayState2.timestamp)
    })
  })

  describe('Validation Errors', () => {
    it('should return 400 when organizationSlug is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('organizationSlug is required')
    })

    it('should return 400 when organizationSlug is null', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: null }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('organizationSlug is required')
    })

    it('should return 400 when organizationSlug is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('organizationSlug is required')
    })
  })

  describe('Service Errors', () => {
    it('should handle SAML service initialization failure', async () => {
      vi.mocked(getSAMLService).mockRejectedValue(
        new Error('Organization not configured for SAML')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'invalid-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate SAML login')
      expect(data.details).toBe('Organization not configured for SAML')
    })

    it('should handle authorization URL generation failure', async () => {
      mockSAMLService.getAuthorizationUrl.mockRejectedValue(
        new Error('Invalid IdP metadata')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate SAML login')
      expect(data.details).toBe('Invalid IdP metadata')
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      vi.mocked(getSAMLService).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate SAML login')
      expect(data.details).toBe('Unknown error')
    })

    it('should handle malformed JSON request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate SAML login')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long organization slug', async () => {
      const longSlug = 'a'.repeat(500)

      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: longSlug }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith(longSlug)
    })

    it('should handle organization slug with special characters', async () => {
      const specialSlug = 'org-123_test.corp'

      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: specialSlug }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith(specialSlug)
    })
  })
})

describe('GET /api/auth/saml/login', () => {
  const mockCookieStore = {
    set: vi.fn(),
  }

  const mockSAMLService = {
    getAuthorizationUrl: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(getSAMLService).mockResolvedValue(mockSAMLService as any)
  })

  describe('Successful Redirect', () => {
    it('should redirect to IdP for valid organization', async () => {
      const mockAuthUrl = 'https://idp.example.com/saml/sso'

      mockSAMLService.getAuthorizationUrl.mockResolvedValue(mockAuthUrl)

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=acme-corp')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(mockAuthUrl)
    })

    it('should set relay state cookie before redirecting', async () => {
      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=test-org')

      await GET(request)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'saml_relay_state',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: false, // NODE_ENV !== 'production' in tests
          sameSite: 'lax',
          maxAge: 600,
          path: '/',
        })
      )
    })
  })

  describe('Validation Errors', () => {
    it('should redirect to login with error when org parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })

    it('should redirect to login with error when org parameter is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })
  })

  describe('Service Errors', () => {
    it('should redirect to login with error details when service fails', async () => {
      vi.mocked(getSAMLService).mockRejectedValue(
        new Error('SAML not configured')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=invalid')

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('SAML%20not%20configured')
    })

    it('should redirect to login when authorization URL generation fails', async () => {
      mockSAMLService.getAuthorizationUrl.mockRejectedValue(
        new Error('Invalid metadata')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=test')

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('Invalid%20metadata')
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      vi.mocked(getSAMLService).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/auth/saml/login?org=test')

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=saml_error')
      expect(location).toContain('Unknown%20error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle organization slug with URL-encoded characters', async () => {
      mockSAMLService.getAuthorizationUrl.mockResolvedValue('https://idp.example.com/saml/sso')

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/login?org=test%20org'
      )

      const response = await GET(request)

      expect(response.status).toBe(307)
      // URL-decoded slug should be passed to service
      expect(getSAMLService).toHaveBeenCalledWith('test org')
    })
  })
})
