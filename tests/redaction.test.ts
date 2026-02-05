/**
 * Security Redaction Tests
 */

import { describe, it, expect } from 'vitest'
import {
  redactString,
  redactObject,
  redactAIContent,
  createSafeSummary,
} from '@/lib/security/redact'

describe('Security Redaction Utilities', () => {
  describe('redactString', () => {
    it('should redact email addresses', () => {
      const text = 'Contact john.doe@example.com for help'
      const redacted = redactString(text, { emails: true, all: false })

      expect(redacted).not.toContain('john.doe@example.com')
      expect(redacted).toContain('@')
    })

    it('should redact phone numbers', () => {
      const text = 'Call me at +1-555-123-4567'
      const redacted = redactString(text, { phones: true, all: false })

      expect(redacted).not.toContain('555-123-4567')
      expect(redacted).toContain('4567') // Last 4 kept
    })

    it('should redact JWT tokens', () => {
      const text = 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123'
      const redacted = redactString(text, { tokens: true, all: false })

      expect(redacted).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
      expect(redacted).toContain('...')
    })

    it('should redact IP addresses partially', () => {
      const text = 'Request from 192.168.1.100'
      const redacted = redactString(text, { ips: true, all: false })

      expect(redacted).toContain('192')
      expect(redacted).not.toContain('192.168.1.100')
      expect(redacted).toContain('***')
    })

    it('should redact UUIDs', () => {
      const text = 'User ID: 550e8400-e29b-41d4-a716-446655440000'
      const redacted = redactString(text, { ids: true, all: false })

      expect(redacted).not.toContain('550e8400-e29b-41d4-a716-446655440000')
      expect(redacted).toContain('...')
    })

    it('should redact credit card numbers', () => {
      const text = 'Card: 4532-1234-5678-9010'
      const redacted = redactString(text, { creditCards: true, all: false })

      expect(redacted).toContain('****-****-****-9010')
      expect(redacted).not.toContain('4532-1234-5678-9010')
    })

    it('should handle multiple patterns in one string', () => {
      const text =
        'Email: test@example.com Phone: 555-1234567 Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      const redacted = redactString(text)

      expect(redacted).not.toContain('test@example.com')
      expect(redacted).not.toContain('555-1234567')
      expect(redacted).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    })
  })

  describe('redactObject', () => {
    it('should redact sensitive field values', () => {
      const obj = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        token: 'abc123xyz789',
      }

      const redacted = redactObject(obj)

      expect(redacted.username).toBe('john')
      expect(redacted.password).not.toBe('secret123')
      expect(redacted.password).toContain('...')
      expect(redacted.token).not.toBe('abc123xyz789')
    })

    it('should redact nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          password: 'secret',
          settings: {
            apiKey: 'key123456',
          },
        },
      }

      const redacted = redactObject(obj)

      expect(redacted.user.name).toBe('John')
      expect(redacted.user.password).not.toBe('secret')
      expect(redacted.user.settings.apiKey).not.toBe('key123456')
    })

    it('should handle arrays of objects', () => {
      const obj = {
        users: [
          { name: 'Alice', password: 'pass1' },
          { name: 'Bob', password: 'pass2' },
        ],
      }

      const redacted = redactObject(obj)

      expect(redacted.users[0].name).toBe('Alice')
      expect(redacted.users[0].password).not.toBe('pass1')
      expect(redacted.users[1].password).not.toBe('pass2')
    })

    it('should use custom sensitive fields list', () => {
      const obj = {
        username: 'john',
        customSecret: 'secret123',
        normalField: 'visible',
      }

      const redacted = redactObject(obj, ['customSecret'])

      expect(redacted.customSecret).not.toBe('secret123')
      // Username not redacted because not in default sensitive fields
      expect(redacted.username).toBe('john')
      expect(redacted.normalField).toBe('visible')
    })
  })

  describe('redactAIContent', () => {
    it('should redact PII from AI prompts', () => {
      const prompt = 'My email is john.doe@example.com and phone is 555-123-4567'
      const redacted = redactAIContent(prompt)

      expect(redacted).not.toContain('john.doe@example.com')
      expect(redacted).toContain('***-***-')
    })

    it('should preserve structure and context', () => {
      const prompt = 'What is the capital of France?'
      const redacted = redactAIContent(prompt)

      // No PII, should be mostly unchanged
      expect(redacted).toContain('capital')
      expect(redacted).toContain('France')
    })
  })

  describe('createSafeSummary', () => {
    it('should truncate long strings', () => {
      const data = {
        shortText: 'hello',
        longText: 'a'.repeat(300),
      }

      const summary = createSafeSummary(data)

      expect(summary.shortText).toBe('hello')
      expect(summary.longText).toContain('[')
      expect(summary.longText).toContain('chars]')
      expect(summary.longText.length).toBeLessThan(data.longText.length)
    })

    it('should limit depth of nested objects', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: 'deep',
            },
          },
        },
      }

      const summary = createSafeSummary(data, 2)

      expect(summary.level1.level2).toBe('[TRUNCATED]')
    })

    it('should summarize large arrays', () => {
      const data = {
        items: Array(100).fill('item'),
      }

      const summary = createSafeSummary(data)

      expect(summary.items).toContain('Array(100)')
    })

    it('should redact sensitive data in summaries', () => {
      const data = {
        user: {
          email: 'test@example.com',
          password: 'secret123',
          name: 'John',
        },
      }

      const summary = createSafeSummary(data)

      expect(summary.user.password).not.toBe('secret123')
      expect(summary.user.email).not.toContain('test@example.com')
    })

    it('should handle complex nested structures', () => {
      const data = {
        users: [
          {
            name: 'Alice',
            contacts: {
              email: 'alice@example.com',
              phone: '555-0001',
            },
          },
        ],
        metadata: {
          total: 100,
          processed: true,
        },
      }

      const summary = createSafeSummary(data, 3)

      expect(summary).toBeDefined()
      expect(summary.users).toBeDefined()
      expect(summary.metadata).toBeDefined()
    })
  })
})
