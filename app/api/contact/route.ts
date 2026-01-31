import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withRedisRateLimit } from '@/lib/security/redisRateLimit'
import { RateLimitPresets } from '@/lib/security/rateLimitPresets'
import { logger } from '@/lib/utils/production-logger'
import {
  sendContactFormNotification,
  sendContactFormConfirmation,
  type ContactFormData,
} from '@/lib/email/service'

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  organization: z.string().max(200).optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

export const POST = withRedisRateLimit(async (request: NextRequest) => {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = contactSchema.parse(body)

    // Send emails
    const [notificationResult, confirmationResult] = await Promise.all([
      sendContactFormNotification(validatedData as ContactFormData),
      sendContactFormConfirmation(validatedData as ContactFormData),
    ])

    // Log results but don't fail the request if emails fail
    if (!notificationResult.success) {
      logger.error('Failed to send notification email', {
        error: notificationResult.error,
        context: 'ContactForm',
      })
    }
    if (!confirmationResult.success) {
      logger.error('Failed to send confirmation email', {
        error: confirmationResult.error,
        context: 'ContactForm',
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Contact form error:', { error: error })

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request. Please try again.',
      },
      { status: 500 }
    )
  }
}, RateLimitPresets.contactForm)

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
