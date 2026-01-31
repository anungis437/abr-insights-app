'use client'

import { logger } from '@/lib/utils/production-logger'

import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setSubmitted(true)

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormState({ name: '', email: '', organization: '', subject: '', message: '' })
        setSubmitted(false)
      }, 5000)
    } catch (err: any) {
      logger.error('Form submission error:', { error: err, context: 'ContactPage' })
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">Get in Touch</h1>
            <p className="text-lg text-primary-50 md:text-xl">
              Have questions about ABR Insights? Our team is here to help you get started.
            </p>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>
      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Send us a Message</h2>

              {submitted ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-green-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
                      <p className="font-medium">Error sending message:</p>
                      <p>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="organization"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Organization
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formState.organization}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formState.subject}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="demo">Request a Demo</option>
                        <option value="pricing">Pricing Question</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formState.message}
                        onChange={handleChange}
                        rows={6}
                        className="input-field"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="relative">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Contact Information</h2>

              <div className="space-y-8">
                <ContactInfoCard
                  icon={<Mail className="h-6 w-6 text-primary-600" />}
                  title="Email Us"
                  content="info@abrinsights.ca"
                  subContent="We'll respond within 24 hours"
                />

                <ContactInfoCard
                  icon={<Phone className="h-6 w-6 text-primary-600" />}
                  title="Call Us"
                  content="+1 (416) 555-0123"
                  subContent="Monday to Friday, 9am to 5pm EST"
                />

                <ContactInfoCard
                  icon={<MapPin className="h-6 w-6 text-primary-600" />}
                  title="Visit Us"
                  content="123 Bay Street, Suite 1500"
                  subContent="Toronto, ON M5H 2Y4"
                />

                {/* Decorative Gradient */}
                <div className="mt-8 h-64 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100"></div>
              </div>

              {/* Office Hours */}
              <div className="mt-8 rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">Office Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">Need Immediate Help?</h3>
                <p className="mb-4 text-gray-600">
                  Check out our documentation and FAQ for quick answers to common questions.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href="/resources" className="btn-secondary">
                    View Resources
                  </a>
                  <a href="/pricing" className="btn-secondary">
                    See Pricing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-primary-50">
              Join hundreds of organizations using ABR Insights to build more equitable workplaces.
            </p>
            <a
              href="/auth/signup"
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>{' '}
    </div>
  )
}

// Supporting Component
function ContactInfoCard({
  icon,
  title,
  content,
  subContent,
}: {
  icon: React.ReactNode
  title: string
  content: string
  subContent: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
        {icon}
      </div>
      <div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-900">{content}</p>
        <p className="text-sm text-gray-600">{subContent}</p>
      </div>
    </div>
  )
}
