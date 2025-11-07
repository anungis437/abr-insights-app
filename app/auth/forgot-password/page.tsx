'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        setIsSubmitted(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-custom flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
                <span className="text-xl font-bold text-white">ABR</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">ABR Insights</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-gray-600">
              {isSubmitted
                ? 'Check your email for instructions'
                : 'Enter your email address and we\'ll send you a link to reset your password'}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending reset link...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-gray-600">
                    We&apos;ve sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>

                {/* Instructions */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
                  <h4 className="mb-2 font-medium text-gray-900">What&apos;s next?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary-600">•</span>
                      <span>Check your email inbox for a message from ABR Insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary-600">•</span>
                      <span>Click the reset password link (it expires in 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary-600">•</span>
                      <span>Create a new password for your account</span>
                    </li>
                  </ul>
                </div>

                {/* Didn't receive email */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Didn&apos;t receive the email?</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="btn-secondary flex-1"
                    >
                      Try Again
                    </button>
                    <Link href="/contact" className="btn-outline flex-1">
                      Contact Support
                    </Link>
                  </div>
                </div>

                {/* Back to Login */}
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-primary-600 hover:text-primary-700">
                Contact Support
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
