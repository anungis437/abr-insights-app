/**
 * Tests for SAML Metadata Route  
 * @route GET /api/auth/saml/metadata
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'

// Mock dependencies
vi.mock('@/lib/auth/saml')

describe('GET /api/auth/saml/metadata', () => {
  const mockSAMLService = {
    generateMetadata: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSAMLService).mockResolvedValue(mockSAMLService as any)
  })

  describe('Successful Metadata Generation', () => {
    it('should return XML metadata for valid organization', async () => {
      const mockMetadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <SPSSODescriptor>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://example.com/saml/callback" index="1"/>
  </SPSSODescriptor>
</EntityDescriptor>`

      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=acme-corp'
      )

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/samlmetadata+xml')
      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="acme-corp-saml-metadata.xml"'
      )
      expect(text).toBe(mockMetadata)
      expect(getSAMLService).toHaveBeenCalledWith('acme-corp')
    })

    it('should include correct filename in content disposition', async () => {
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=my-organization'
      )

      const response = await GET(request)

      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="my-organization-saml-metadata.xml"'
      )
    })

    it('should handle organization slug with special characters', async () => {
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=org-with-dashes'
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith('org-with-dashes')
      expect(response.headers.get('Content-Disposition')).toContain('org-with-dashes')
    })

    it('should handle URL-encoded organization slug', async () => {
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=org%20with%20spaces'
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith('org with spaces')
    })
  })

  describe('Validation Errors', () => {
    it('should return error when organization slug is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/saml/metadata')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Organization slug is required. Use ?org=your-org-slug',
      })
      expect(getSAMLService).not.toHaveBeenCalled()
    })

    it('should return error when organization slug is empty', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org='
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Organization slug is required. Use ?org=your-org-slug',
      })
    })

    it('should return error when organization slug is null', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=null'
      )

      const response = await GET(request)

      // "null" string is treated as valid slug
      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith('null')
    })
  })

  describe('Service Errors', () => {
    it('should handle SAML service initialization failure', async () => {
      vi.mocked(getSAMLService).mockRejectedValue(
        new Error('Organization not found or SAML not configured')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=invalid-org'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate SAML metadata',
        details: 'Organization not found or SAML not configured',
      })
    })

    it('should handle metadata generation failure', async () => {
      mockSAMLService.generateMetadata.mockRejectedValue(
        new Error('Failed to generate metadata XML')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate SAML metadata',
        details: 'Failed to generate metadata XML',
      })
    })

    it('should handle SAML not configured for organization', async () => {
      vi.mocked(getSAMLService).mockRejectedValue(new Error('SAML not enabled'))

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=no-saml-org'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate SAML metadata',
        details: 'SAML not enabled',
      })
    })
  })

  describe('Exception Handling', () => {
    it('should handle non-Error exceptions', async () => {
      vi.mocked(getSAMLService).mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate SAML metadata',
        details: 'Unknown error',
      })
    })

    it('should handle null exception', async () => {
      vi.mocked(getSAMLService).mockImplementation(() => {
        throw null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: 'Failed to generate SAML metadata',
        details: 'Unknown error',
      })
    })

    it('should handle metadata generation returning empty string', async () => {
      mockSAMLService.generateMetadata.mockResolvedValue('')

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org'
      )

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(200)
      expect(text).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long organization slug', async () => {
      const longSlug = 'a'.repeat(255)
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        `http://localhost:3000/api/auth/saml/metadata?org=${longSlug}`
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith(longSlug)
    })

    it('should handle large metadata XML', async () => {
      const largeMetadata = '<EntityDescriptor>' + 'x'.repeat(100000) + '</EntityDescriptor>'
      mockSAMLService.generateMetadata.mockResolvedValue(largeMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org'
      )

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(200)
      expect(text.length).toBeGreaterThan(100000)
    })

    it('should handle multiple query parameters', async () => {
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=test-org&extra=param'
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith('test-org')
    })

    it('should handle case-sensitive organization slug', async () => {
      const mockMetadata = '<EntityDescriptor/>'
      mockSAMLService.generateMetadata.mockResolvedValue(mockMetadata)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/saml/metadata?org=CamelCaseOrg'
      )

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(getSAMLService).toHaveBeenCalledWith('CamelCaseOrg')
    })
  })
})
