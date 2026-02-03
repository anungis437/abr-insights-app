import { Resend } from 'resend'
import { render } from '@react-email/render'
import ContactConfirmationEmail from '@/emails/contact-confirmation'
import NewsletterWelcomeEmail from '@/emails/newsletter-welcome'
import { logger } from '@/lib/utils/production-logger'

// Lazy initialization to prevent build errors when API key is not available
let resendInstance: Resend | null = null

function getResendClient() {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@abrinsights.ca'
const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL || 'support@abrinsights.ca'

export interface ContactFormData {
  name: string
  email: string
  organization?: string
  subject: string
  message: string
}

export interface NewsletterData {
  email: string
  firstName?: string
  lastName?: string
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormNotification(data: ContactFormData) {
  const resend = getResendClient()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured', { operation: 'sendContactFormNotification' })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_RECIPIENT,
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Organization:</strong> ${data.organization || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Submitted at: ${new Date().toISOString()}</p>
      `,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send contact form notification', {
      error,
      recipient: CONTACT_RECIPIENT,
    })
    return { success: false, error: 'Failed to send notification email' }
  }
}

/**
 * Send confirmation email to contact form submitter
 */
export async function sendContactFormConfirmation(data: ContactFormData) {
  const resend = getResendClient()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured', { operation: 'sendContactFormConfirmation' })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      ContactConfirmationEmail({
        name: data.name,
        subject: data.subject,
      })
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Thank you for contacting ABR Insights',
      html: emailHtml,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send contact confirmation email', { error, recipient: data.email })
    return { success: false, error: 'Failed to send confirmation email' }
  }
}

/**
 * Send welcome email to newsletter subscriber
 */
export async function sendNewsletterWelcome(data: NewsletterData) {
  const resend = getResendClient()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured', { operation: 'sendNewsletterWelcome' })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      NewsletterWelcomeEmail({
        firstName: data.firstName,
      })
    )

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Welcome to ABR Insights Newsletter',
      html: emailHtml,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send newsletter welcome email', { error, recipient: data.email })
    return { success: false, error: 'Failed to send welcome email' }
  }
}

/**
 * Generic email sender for custom use cases
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const resend = getResendClient()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured', { operation: 'sendEmail', recipient: to })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send email', { error, recipient: to, subject })
    return { success: false, error: 'Failed to send email' }
  }
}

export interface SupportTicketData {
  ticketId: string
  userEmail: string
  userName: string
  type: string
  subject: string
  description: string
  priority: string
}

/**
 * Send support ticket notification to admin team
 */
export async function sendSupportTicketNotification(data: SupportTicketData) {
  const resend = getResendClient()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured', { operation: 'sendSupportTicketNotification' })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_RECIPIENT,
      replyTo: data.userEmail,
      subject: `[${data.priority.toUpperCase()}] Support Ticket: ${data.subject}`,
      html: `
        <h2>New Support Ticket #${data.ticketId}</h2>
        <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Priority:</strong> ${data.priority}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Description:</h3>
        <p style="white-space: pre-wrap;">${data.description}</p>
        <hr />
        <p><small>Ticket ID: ${data.ticketId}</small></p>
      `,
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send support ticket notification', {
      error,
      ticketId: data.ticketId,
      recipient: CONTACT_RECIPIENT,
    })
    return { success: false, error: 'Failed to send notification email' }
  }
}
