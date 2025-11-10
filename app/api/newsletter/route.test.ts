/**
 * Integration Tests: Newsletter Subscription
 * 
 * Tests the /api/newsletter endpoint for email subscriptions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, OPTIONS } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock email service
vi.mock('@/lib/email/service', () => ({
  sendNewsletterWelcome: vi.fn(),
}))

import { supabase } from '@/lib/supabase'
import { sendNewsletterWelcome } from '@/lib/email/service'

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock requests
  const createMockRequest = (body: any): NextRequest => {
    return {
      json: async () => body,
    } as NextRequest
  }

  // Helper to mock Supabase select chain
  const mockSupabaseSelect = (data: any = null, error: any = null) => {
    const eqMock = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data, error }),
    })

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any)

    return { selectMock, eqMock }
  }

  // Helper to mock Supabase insert
  const mockSupabaseInsert = (error: any = null) => {
    const insertMock = vi.fn().mockResolvedValue({ error })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: insertMock,
    } as any)

    return insertMock
  }

  describe('Successful Subscriptions', () => {
    it('should subscribe new email address', async () => {
      mockSupabaseSelect(null) // No existing subscriber
      const insertMock = mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({ success: true })

      const request = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        success: true,
        message: 'Thank you for subscribing! Welcome to ABR Insights newsletter.',
      })

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          is_active: true,
        })
      )
      expect(sendNewsletterWelcome).toHaveBeenCalledWith({ email: 'test@example.com' })
    })

    it('should subscribe with first name', async () => {
      mockSupabaseSelect(null)
      const insertMock = mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({ success: true })

      const request = createMockRequest({
        email: 'john@example.com',
        firstName: 'John',
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          first_name: 'John',
        })
      )
      expect(sendNewsletterWelcome).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
      })
    })

    it('should subscribe with first and last name', async () => {
      mockSupabaseSelect(null)
      const insertMock = mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({ success: true })

      const request = createMockRequest({
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'jane@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
        })
      )
    })

    it('should succeed even if welcome email fails', async () => {
      mockSupabaseSelect(null)
      mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({
        success: false,
        error: 'Email service unavailable',
      })

      const request = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })
  })

  describe('Email Validation', () => {
    it('should reject missing email', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid email address')
      expect(data.errors).toBeDefined()
    })

    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        email: 'not-an-email',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid email address')
    })

    it('should reject empty email', async () => {
      const request = createMockRequest({
        email: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject null email', async () => {
      const request = createMockRequest({
        email: null,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject email without @ symbol', async () => {
      const request = createMockRequest({
        email: 'testexample.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject email without domain', async () => {
      const request = createMockRequest({
        email: 'test@',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('First Name Validation', () => {
    it('should reject empty first name when provided', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        firstName: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContainEqual(
        expect.objectContaining({
          field: 'firstName',
          message: 'First name is required',
        })
      )
    })

    it('should reject first name exceeding 100 characters', async () => {
      const longName = 'A'.repeat(101)
      const request = createMockRequest({
        email: 'test@example.com',
        firstName: longName,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Last Name Validation', () => {
    it('should reject last name exceeding 100 characters', async () => {
      const longName = 'B'.repeat(101)
      const request = createMockRequest({
        email: 'test@example.com',
        firstName: 'John',
        lastName: longName,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Duplicate Email Handling', () => {
    it('should reject already subscribed email', async () => {
      mockSupabaseSelect({
        id: 1,
        email: 'existing@example.com',
      })

      const request = createMockRequest({
        email: 'existing@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({
        success: false,
        message: 'This email is already subscribed to our newsletter.',
      })
    })

    it('should not attempt insert for duplicate email', async () => {
      mockSupabaseSelect({
        id: 1,
        email: 'existing@example.com',
      })

      const request = createMockRequest({
        email: 'existing@example.com',
      })

      await POST(request)

      // Verify insert was not called (only select chain should be called)
      const fromCalls = vi.mocked(supabase.from).mock.calls
      expect(fromCalls.length).toBe(1)
      expect(fromCalls[0][0]).toBe('newsletter_subscribers')
    })
  })

  describe('Database Errors', () => {
    it('should handle database insert errors', async () => {
      mockSupabaseSelect(null)
      mockSupabaseInsert({ message: 'Database connection failed' })

      const request = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        message: 'An error occurred while subscribing. Please try again.',
      })
    })

    it('should handle database query errors', async () => {
      // Mock Supabase to throw during select
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as NextRequest

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should reject email with leading/trailing whitespace', async () => {
      const request = createMockRequest({
        email: '  test@example.com  ',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid email address')
    })

    it('should accept email with plus addressing', async () => {
      mockSupabaseSelect(null)
      mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({ success: true })

      const request = createMockRequest({
        email: 'test+newsletter@example.com',
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should accept email with subdomain', async () => {
      mockSupabaseSelect(null)
      mockSupabaseInsert()
      vi.mocked(sendNewsletterWelcome).mockResolvedValue({ success: true })

      const request = createMockRequest({
        email: 'test@mail.example.com',
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })
  })
})

describe('OPTIONS /api/newsletter', () => {
  it('should return CORS headers', async () => {
    const response = await OPTIONS()

    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
  })
})
