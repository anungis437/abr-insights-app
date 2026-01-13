import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'
import { sendNewsletterWelcome, type NewsletterData } from '@/lib/email/service'

// Newsletter subscription validation schema
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export const POST = withRateLimit(
  RateLimitPresets.newsletter,
  async (request: NextRequest) => {
    try {
      // Parse request body
      const body = await request.json()

      // Validate input
      const validatedData = newsletterSchema.parse(body)

      // Get server-side Supabase client
      const supabase = await createClient()

      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, email')
        .eq('email', validatedData.email)
        .single()

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: 'This email is already subscribed to our newsletter.',
          },
          { status: 409 }
        )
      }

      // Insert newsletter subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: validatedData.email,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          subscribed_at: new Date().toISOString(),
          is_active: true,
        })

      if (error) {
        console.error('Newsletter subscription error:', error)
        throw new Error('Failed to subscribe')
      }

      // Send welcome email
      const emailResult = await sendNewsletterWelcome(validatedData as NewsletterData)
      
      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error)
        // Continue anyway - subscription was successful
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for subscribing! Welcome to ABR Insights newsletter.',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Newsletter API error:', error)

      // Handle validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid email address',
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
          message: 'An error occurred while subscribing. Please try again.',
        },
        { status: 500 }
      )
    }
  }
)

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
