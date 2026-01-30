'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { STRIPE_PRICES } from '@/lib/stripe'
import { loadStripe } from '@stripe/stripe-js'
import { useEntitlements } from '@/hooks/use-entitlements'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TestCheckoutPage() {
  const router = useRouter()
  const { entitlements, isLoading: loadingEntitlements } = useEntitlements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (tier: string, priceId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Test Stripe Checkout</h1>
        <p className="text-gray-600">
          Test the complete Stripe → Webhook → Entitlements → UI flow
        </p>
      </div>

      {/* Current Entitlements Status */}
      <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <CheckCircle className="h-6 w-6 text-blue-600" />
          Current Entitlements Status
        </h2>
        {loadingEntitlements ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading entitlements...
          </div>
        ) : entitlements ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Tier:</span>{' '}
              <span className="rounded bg-blue-100 px-2 py-1 text-sm font-semibold">
                {entitlements.tier}
              </span>
            </div>
            <div>
              <span className="font-medium">Seats:</span> {entitlements.seatsUsed} /{' '}
              {entitlements.seatCount === -1 ? 'Unlimited' : entitlements.seatCount}
            </div>
            <div>
              <span className="font-medium">Features:</span>
              <ul className="ml-6 mt-2 space-y-1 text-sm">
                <li>
                  AI Assistant: {entitlements.features.aiAssistantAccess ? '✅ Yes' : '❌ No'}
                </li>
                <li>AI Coach: {entitlements.features.aiCoachAccess ? '✅ Yes' : '❌ No'}</li>
                <li>
                  Export Capabilities:{' '}
                  {entitlements.features.exportCapabilities ? '✅ Yes' : '❌ No'}
                </li>
                <li>
                  Advanced Analytics:{' '}
                  {entitlements.features.advancedAnalytics ? '✅ Yes' : '❌ No'}
                </li>
                <li>
                  Max Courses:{' '}
                  {entitlements.features.maxCoursesAuthored === -1
                    ? 'Unlimited'
                    : entitlements.features.maxCoursesAuthored}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No entitlements loaded (login required)</p>
        )}
      </div>

      {/* Test Checkout Buttons */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Test Subscription Checkout</h2>

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Professional Tier */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">Professional</h3>
            <p className="mb-4 text-3xl font-bold text-gray-900">$49/month</p>
            <ul className="mb-6 space-y-2 text-sm text-gray-600">
              <li>✅ AI Assistant & Coach</li>
              <li>✅ Advanced Analytics</li>
              <li>✅ Export Capabilities</li>
              <li>✅ 50 Courses Max</li>
              <li>✅ 1 Seat</li>
            </ul>
            <button
              onClick={() =>
                handleCheckout('PROFESSIONAL', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL!)
              }
              disabled={loading || !process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Test Professional Checkout
                </>
              )}
            </button>
            {!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL && (
              <p className="mt-2 text-xs text-red-600">
                Configure STRIPE_PRICE_ID_PROFESSIONAL in .env.local
              </p>
            )}
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-lg border-2 border-purple-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">Enterprise</h3>
            <p className="mb-4 text-3xl font-bold text-gray-900">$199/month</p>
            <ul className="mb-6 space-y-2 text-sm text-gray-600">
              <li>✅ Everything in Professional</li>
              <li>✅ Custom Branding</li>
              <li>✅ SSO Enabled</li>
              <li>✅ Unlimited Courses</li>
              <li>✅ Unlimited Seats</li>
            </ul>
            <button
              onClick={() =>
                handleCheckout('ENTERPRISE', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE!)
              }
              disabled={loading || !process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Test Enterprise Checkout
                </>
              )}
            </button>
            {!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE && (
              <p className="mt-2 text-xs text-red-600">
                Configure STRIPE_PRICE_ID_ENTERPRISE in .env.local
              </p>
            )}
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-3 font-semibold">Testing Instructions:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>1. Start Stripe webhook listener in terminal:</strong>
              <code className="ml-2 rounded bg-gray-200 px-2 py-1">
                stripe listen --forward-to localhost:3000/api/webhooks/stripe
              </code>
            </li>
            <li>
              <strong>2. Use Stripe test card:</strong> 4242 4242 4242 4242 (any future expiry, any
              CVC)
            </li>
            <li>
              <strong>3. Complete checkout</strong> and verify webhook fires
            </li>
            <li>
              <strong>4. Check entitlements updated:</strong> Refresh this page to see new tier
            </li>
            <li>
              <strong>5. Test feature access:</strong> Try AI Assistant (/ai-assistant), exports,
              etc.
            </li>
            <li>
              <strong>6. Verify database:</strong> Check organization_subscriptions and
              seat_allocations tables
            </li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <a
            href="/ai-assistant"
            className="rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Test AI Assistant →
          </a>
          <a
            href="/ai-coach"
            className="rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Test AI Coach →
          </a>
          <a
            href="/admin/risk-heatmap"
            className="rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Test Export →
          </a>
          <a
            href="/pricing"
            className="rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            View Pricing →
          </a>
        </div>
      </div>
    </div>
  )
}
