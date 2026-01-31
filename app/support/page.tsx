/**
 * Support Tickets Page (P1 Commercial Readiness)
 * Route: /support
 *
 * Features:
 * - Submit support tickets for various issue types
 * - View ticket status and history
 * - FAQ and self-service options
 * - AI report workflow
 * - Data export/deletion requests
 */

'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Flag,
  DollarSign,
  Download,
  Trash2,
  HelpCircle,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

type TicketType =
  | 'bug_report'
  | 'feature_request'
  | 'ai_report'
  | 'billing_dispute'
  | 'data_export'
  | 'data_deletion'
  | 'general_inquiry'

interface TicketTypeOption {
  id: TicketType
  label: string
  description: string
  icon: any
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

const ticketTypes: TicketTypeOption[] = [
  {
    id: 'ai_report',
    label: 'Report AI Output',
    description: 'Report concerning or inappropriate AI-generated content',
    icon: Flag,
    priority: 'high',
  },
  {
    id: 'bug_report',
    label: 'Bug Report',
    description: 'Report a technical issue or error',
    icon: Bug,
    priority: 'medium',
  },
  {
    id: 'billing_dispute',
    label: 'Billing Issue',
    description: 'Dispute a charge or subscription issue',
    icon: DollarSign,
    priority: 'high',
  },
  {
    id: 'data_export',
    label: 'Export My Data',
    description: 'Request a copy of your personal data',
    icon: Download,
    priority: 'medium',
  },
  {
    id: 'data_deletion',
    label: 'Delete My Data',
    description: 'Request permanent deletion of your account',
    icon: Trash2,
    priority: 'urgent',
  },
  {
    id: 'feature_request',
    label: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    icon: Lightbulb,
    priority: 'low',
  },
  {
    id: 'general_inquiry',
    label: 'General Question',
    description: 'Ask a question or get help',
    icon: HelpCircle,
    priority: 'medium',
  },
]

export default function SupportPage() {
  const [selectedType, setSelectedType] = useState<TicketType | null>(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !subject || !description) return

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          subject,
          description,
          priority: ticketTypes.find((t) => t.id === selectedType)?.priority || 'medium',
          metadata: {
            url: window.location.href,
            browser: navigator.userAgent,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTicketId(data.ticket.id)
        setSubmitStatus('success')
        setSubject('')
        setDescription('')
        setSelectedType(null)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="mt-2 text-gray-600">Get help, report issues, or submit feature requests</p>
      </div>

      {/* Submit Status */}
      {submitStatus === 'success' && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Ticket submitted successfully!</strong>
            <br />
            Ticket ID: <code className="font-mono">{ticketId}</code>
            <br />
            We'll respond within 24-48 hours.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Failed to submit ticket. Please try again or email support@abrinsights.com
          </AlertDescription>
        </Alert>
      )}

      {/* Ticket Type Selection */}
      {!selectedType && (
        <div className="grid gap-4 md:grid-cols-2">
          {ticketTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
                  <Icon className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Ticket Form */}
      {selectedType && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
              {(() => {
                const Icon = ticketTypes.find((t) => t.id === selectedType)?.icon || MessageSquare
                return <Icon className="h-6 w-6 text-teal-600" />
              })()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {ticketTypes.find((t) => t.id === selectedType)?.label}
              </h2>
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-teal-600 hover:underline"
              >
                Change type
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                minLength={5}
                maxLength={200}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={5000}
                rows={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Provide as much detail as possible..."
              />
              <p className="mt-1 text-sm text-gray-500">{description.length}/5000 characters</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !subject || !description}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSelectedType(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">
              How long does it take to respond to tickets?
            </summary>
            <p className="mt-2 text-gray-600">
              We aim to respond within 24-48 hours. Urgent issues (billing disputes, data deletions,
              AI reports) are prioritized.
            </p>
          </details>

          <details className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">
              How do I export my data?
            </summary>
            <p className="mt-2 text-gray-600">
              Submit a "Export My Data" ticket. We'll generate a ZIP file with all your personal
              data within 7 days, per GDPR requirements.
            </p>
          </details>

          <details className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">
              What happens when I delete my account?
            </summary>
            <p className="mt-2 text-gray-600">
              Submit a "Delete My Data" ticket. After identity verification, we'll permanently
              delete your account and personal data within 30 days. This action is irreversible.
            </p>
          </details>

          <details className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer font-semibold text-gray-900">
              How do I dispute a billing charge?
            </summary>
            <p className="mt-2 text-gray-600">
              Submit a "Billing Issue" ticket with your invoice ID and reason for dispute. We'll
              investigate and respond within 48 hours. Refunds are processed within 5-10 business
              days if approved.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
