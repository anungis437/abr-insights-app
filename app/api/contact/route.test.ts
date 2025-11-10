/**
 * Integration tests for Contact API Route
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock the email service
vi.mock('@/lib/email/service', () => ({
  sendContactFormNotification: vi.fn(),
  sendContactFormConfirmation: vi.fn(),
}));

import {
  sendContactFormNotification,
  sendContactFormConfirmation,
} from '@/lib/email/service';

// Helper to create mock NextRequest
function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (sendContactFormNotification as Mock).mockResolvedValue({ success: true });
    (sendContactFormConfirmation as Mock).mockResolvedValue({ success: true });
  });

  describe('Successful Submissions', () => {
    it('should accept valid contact form data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry about courses',
        message: 'I would like to learn more about your courses.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain('Thank you for contacting us');
    });

    it('should accept optional organization field', async () => {
      const validData = {
        name: 'Jane Smith',
        email: 'jane@company.com',
        organization: 'ABC Corp',
        subject: 'Partnership opportunity',
        message: 'We are interested in partnering with you for corporate training.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should call both email services with correct data', async () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content here.',
      };

      const request = createMockRequest(validData);
      await POST(request);

      expect(sendContactFormNotification).toHaveBeenCalledWith(validData);
      expect(sendContactFormConfirmation).toHaveBeenCalledWith(validData);
      expect(sendContactFormNotification).toHaveBeenCalledTimes(1);
      expect(sendContactFormConfirmation).toHaveBeenCalledTimes(1);
    });

    it('should succeed even if notification email fails', async () => {
      (sendContactFormNotification as Mock).mockResolvedValue({
        success: false,
        error: 'SMTP error',
      });

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message content.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should succeed even if confirmation email fails', async () => {
      (sendContactFormConfirmation as Mock).mockResolvedValue({
        success: false,
        error: 'Email delivery failed',
      });

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message content.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('Validation Errors - Name Field', () => {
    it('should reject name shorter than 2 characters', async () => {
      const invalidData = {
        name: 'A',
        email: 'valid@example.com',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toBeDefined();
      expect(json.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('at least 2 characters'),
          }),
        ])
      );
    });

    it('should reject name longer than 100 characters', async () => {
      const invalidData = {
        name: 'A'.repeat(101),
        email: 'valid@example.com',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should reject missing name field', async () => {
      const invalidData = {
        email: 'valid@example.com',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toBeDefined();
    });
  });

  describe('Validation Errors - Email Field', () => {
    it('should reject invalid email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('Invalid email'),
          }),
        ])
      );
    });

    it('should reject missing email field', async () => {
      const invalidData = {
        name: 'John Doe',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should reject email with spaces', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john doe@example.com',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('Validation Errors - Subject Field', () => {
    it('should reject subject shorter than 3 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hi',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'subject',
            message: expect.stringContaining('at least 3 characters'),
          }),
        ])
      );
    });

    it('should reject subject longer than 200 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'A'.repeat(201),
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should reject missing subject field', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('Validation Errors - Message Field', () => {
    it('should reject message shorter than 10 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid subject',
        message: 'Short',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'message',
            message: expect.stringContaining('at least 10 characters'),
          }),
        ])
      );
    });

    it('should reject message longer than 5000 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid subject',
        message: 'A'.repeat(5001),
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should reject missing message field', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid subject',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('Validation Errors - Organization Field', () => {
    it('should accept empty organization field', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        organization: '',
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should reject organization longer than 200 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        organization: 'A'.repeat(201),
        subject: 'Valid subject',
        message: 'Valid message content here.',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should return all validation errors at once', async () => {
      const invalidData = {
        name: 'A',
        email: 'invalid-email',
        subject: 'Hi',
        message: 'Short',
      };

      const request = createMockRequest(invalidData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThanOrEqual(4); // At least 4 errors
    });
  });

  describe('Request Parsing Errors', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not-json-data',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode characters in name', async () => {
      const validData = {
        name: 'José García',
        email: 'jose@example.com',
        subject: 'Test Subject',
        message: 'Test message content here.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should handle emojis in message', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Great courses! 😊',
        message: 'I love your platform! 🎉 Keep up the great work!',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should reject email with leading/trailing whitespace', async () => {
      const validData = {
        name: 'John Doe',
        email: '  john@example.com  ',
        subject: 'Test Subject',
        message: 'Test message content here.',
      };

      const request = createMockRequest(validData);
      const response = await POST(request);

      // Zod doesn't automatically trim, email validation should fail
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.errors).toHaveLength(1);
      expect(json.errors[0].field).toBe('email');
    });
  });
});

describe('OPTIONS /api/contact', () => {
  it('should return CORS headers', async () => {
    const response = await OPTIONS();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
  });
});
