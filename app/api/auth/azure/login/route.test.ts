/**
 * Tests for Azure AD Login Route
 * @route POST /api/auth/azure/login
 * @route GET /api/auth/azure/login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { NextRequest } from 'next/server'
import { getAzureADService } from '@/lib/auth/azure-ad'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Mock dependencies
vi.mock('@/lib/auth/azure-ad')
vi.mock('next/headers')
vi.mock('crypto')

describe('POST /api/auth/azure/login', () => {
  const mockCookieStore = {
    set: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
  })

  describe('Successful Login Initiation', () => {
    it('should return authorization URL for valid organization', async () => {
      const mockAuthUrl = 'https://login.microsoftonline.com/authorize?client_id=test'
      const mockState = 'random_state_value'

      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from(mockState))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue(mockAuthUrl),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'acme-corp' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.authUrl).toBe(mockAuthUrl)
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'azure_ad_state',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 600,
        })
      )
    })

    it('should generate unique state parameter for each request', async () => {
      const mockState1 = 'state_1'
      const mockState2 = 'state_2'

      vi.mocked(crypto.randomBytes)
        .mockReturnValueOnce(Buffer.from(mockState1))
        .mockReturnValueOnce(Buffer.from(mockState2))

      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue('https://auth.url'),
      } as any)

      const request1 = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'org1' }),
      })

      const request2 = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'org2' }),
      })

      await POST(request1)
      await POST(request2)

      const calls = mockCookieStore.set.mock.calls
      expect(calls[0][1]).not.toBe(calls[1][1])
    })

    it('should pass organization slug to Azure AD service', async () => {
      const mockGetAuthUrl = vi.fn().mockResolvedValue('https://auth.url')

      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: mockGetAuthUrl,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      await POST(request)

      expect(getAzureADService).toHaveBeenCalledWith('test-org')
      expect(mockGetAuthUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'test-org'
      )
    })
  })

  describe('Validation Errors', () => {
    it('should return 400 when organizationSlug is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Organization slug is required')
    })

    it('should return 400 when organizationSlug is null', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: null }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Organization slug is required')
    })

    it('should return 400 when organizationSlug is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: '' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Organization slug is required')
    })
  })

  describe('Service Errors', () => {
    it('should handle Azure AD service initialization failure', async () => {
      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockRejectedValue(
        new Error('Organization not configured for Azure AD')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'invalid-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate Azure AD login')
      expect(data.details).toBe('Organization not configured for Azure AD')
    })

    it('should handle authorization URL generation failure', async () => {
      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockRejectedValue(new Error('Invalid tenant configuration')),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate Azure AD login')
      expect(data.details).toBe('Invalid tenant configuration')
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: 'test-org' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate Azure AD login')
      expect(data.details).toBe('Unknown error')
    })

    it('should handle malformed JSON request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to initiate Azure AD login')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long organization slug', async () => {
      const longSlug = 'a'.repeat(500)

      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue('https://auth.url'),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: longSlug }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(getAzureADService).toHaveBeenCalledWith(longSlug)
    })

    it('should handle organization slug with special characters', async () => {
      const specialSlug = 'org-123_test.corp'

      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue('https://auth.url'),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login', {
        method: 'POST',
        body: JSON.stringify({ organizationSlug: specialSlug }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(getAzureADService).toHaveBeenCalledWith(specialSlug)
    })
  })
})

describe('GET /api/auth/azure/login', () => {
  const mockCookieStore = {
    set: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
  })

  describe('Successful Redirect', () => {
    it('should redirect to Azure AD for valid organization', async () => {
      const mockAuthUrl = 'https://login.microsoftonline.com/authorize'

      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue(mockAuthUrl),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login?org=acme-corp')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe(mockAuthUrl)
    })

    it('should set state cookie before redirecting', async () => {
      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockResolvedValue({
        getAuthorizationUrl: vi.fn().mockResolvedValue('https://auth.url'),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login?org=test-org')

      await GET(request)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'azure_ad_state',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: false, // NODE_ENV !== 'production' in tests
          sameSite: 'lax',
          maxAge: 600,
        })
      )
    })
  })

  describe('Validation Errors', () => {
    it('should redirect to login with error when org parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })

    it('should redirect to login with error when org parameter is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/azure/login?org=')

      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login?error=missing_organization')
    })
  })

  describe('Service Errors', () => {
    it('should redirect to login with error details when service fails', async () => {
      vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from('state'))
      vi.mocked(getAzureADService).mockRejectedValue(
        new Error('Azure AD not configured')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/azure/login?org=invalid')

      const response = await GET(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login?error=azure_ad_error')
    })
  })
})
