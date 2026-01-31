/**
 * Support Ticket API (P1 Commercial Readiness)
 * POST /api/support/ticket
 *
 * Creates support tickets for user issues, AI reports, billing disputes, data requests
 * Stores in Supabase for tracking and response
 */

import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'
import { z } from 'zod'

const ticketSchema = z.object({
  type: z.enum([
    'bug_report',
    'feature_request',
    'ai_report',
    'billing_dispute',
    'data_export',
    'data_deletion',
    'general_inquiry',
  ]),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  metadata: z
    .object({
      url: z.string().optional(),
      ai_session_id: z.string().optional(),
      invoice_id: z.string().optional(),
      browser: z.string().optional(),
      screenshot_url: z.string().optional(),
    })
    .optional(),
})

async function createTicketHandler(request: NextRequest, context: GuardedContext) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const validation = ticketSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid ticket data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { type, subject, description, priority, metadata } = validation.data

    // Create support ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: context.user!.id,
        organization_id: context.organizationId,
        type,
        subject,
        description,
        priority,
        status: 'open',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create support ticket', error as Error, {
        userId: context.user!.id,
        type,
      })
      return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 })
    }

    // Send notification email (TODO: implement email service)
    // await sendSupportTicketEmail(ticket)

    logger.info('Support ticket created', {
      ticketId: ticket.id,
      userId: context.user!.id,
      type,
      priority,
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        type: ticket.type,
        subject: ticket.subject,
        status: ticket.status,
        created_at: ticket.created_at,
      },
    })
  } catch (error) {
    logger.error('Support ticket creation error', error as Error, {
      userId: context.user?.id,
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = guardedRoute(createTicketHandler, {
  requireAuth: true,
  requireOrg: false, // Tickets can be created without org context
  anyPermissions: [], // All authenticated users can create tickets
})
