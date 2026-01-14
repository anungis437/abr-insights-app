import { HelpCircle, BookOpen, MessageCircle, Mail, Phone, Video, FileText, Search, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Help Center | ABR Insights',
  description: 'Get help with ABR Insights platform, courses, and case database',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-24 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <HelpCircle className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              How Can We Help You?
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Find answers, get support, and learn how to make the most of ABR Insights
            </p>

            {/* Search */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full rounded-lg py-4 pl-12 pr-4 text-lg text-gray-900 shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Popular Help Topics
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/help/getting-started" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Getting Started</h3>
                <p className="mb-4 text-gray-600">
                  Learn the basics of navigating the platform and setting up your account
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>

              <Link href="/help/courses" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Courses & Learning</h3>
                <p className="mb-4 text-gray-600">
                  Enroll in courses, track progress, and earn certificates
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>

              <Link href="/help/cases" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Case Database</h3>
                <p className="mb-4 text-gray-600">
                  Search, analyze, and export tribunal decisions
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>

              <Link href="/help/account" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <HelpCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Account & Billing</h3>
                <p className="mb-4 text-gray-600">
                  Manage your account, subscription, and payment details
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>

              <Link href="/help/teams" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                  <MessageCircle className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Team Management</h3>
                <p className="mb-4 text-gray-600">
                  Add members, assign roles, and manage team access
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>

              <Link href="/help/technical" className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Technical Issues</h3>
                <p className="mb-4 text-gray-600">
                  Troubleshoot common problems and technical difficulties
                </p>
                <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View guides →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">How do I enroll in a course?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>To enroll in a course:</p>
                  <ol className="mt-2 ml-6 list-decimal space-y-1">
                    <li>Browse the course catalog from your dashboard</li>
                    <li>Click on a course to view details</li>
                    <li>Click "Enroll Now" or "Start Course"</li>
                    <li>Complete the enrollment process and begin learning</li>
                  </ol>
                </div>
              </details>

              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">How do I search for specific tribunal cases?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  <p>Use the case database search features:</p>
                  <ul className="mt-2 ml-6 list-disc space-y-1">
                    <li>Navigate to the Cases section from your dashboard</li>
                    <li>Enter keywords, case names, or citations in the search bar</li>
                    <li>Use filters to narrow by tribunal, date, category, or province</li>
                    <li>Click on a case to view full details and analysis</li>
                  </ul>
                </div>
              </details>

              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">Can I download certificates after completing a course?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  Yes! Once you complete a course with a passing grade, you can download your certificate from the "My Certificates" section in your dashboard. Certificates include verification codes and can be shared digitally.
                </div>
              </details>

              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">How do I add team members to my organization account?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  Organization admins can add team members by navigating to Team Management in the dashboard. Enter email addresses to send invitations, and assign appropriate roles and permissions.
                </div>
              </details>

              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">What payment methods do you accept?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express) and process payments securely through Stripe. For enterprise accounts, we also offer invoice billing.
                </div>
              </details>

              <details className="group rounded-lg border border-gray-200 p-6 hover:border-primary-300">
                <summary className="flex cursor-pointer items-start justify-between font-semibold text-gray-900">
                  <span className="flex-1">How do I cancel my subscription?</span>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-600 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-600">
                  You can cancel your subscription anytime from Account Settings → Billing. Your access will continue until the end of your current billing period. No refunds are provided for partial months.
                </div>
              </details>
            </div>

            <div className="mt-8 text-center">
              <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
                View all FAQs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Still Need Help?
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Email Support</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Get help via email within 24 hours
                </p>
                <Link href="/contact" className="btn-secondary text-sm">
                  Send Email
                </Link>
              </div>

              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Live Chat</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Chat with our support team
                </p>
                <button className="btn-secondary text-sm">
                  Start Chat
                </button>
              </div>

              <div className="card text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Phone Support</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Enterprise customers only
                </p>
                <button className="btn-secondary text-sm">
                  Request Callback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Create a free account and explore our platform
          </p>
          <Link href="/auth/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Sign Up Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
