'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEntitlements } from '@/hooks/use-entitlements'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Calendar,
  Users,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface BillingInfo {
  tier: string
  status: string
  currentPeriodEnd: string | null
  seatCount: number
  seatsUsed: number
  stripeCustomerId: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const { entitlements, loading } = useEntitlements()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function loadBillingInfo() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get user's profile for organization_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      // Get organization subscription
      const { data: subscription } = await supabase
        .from('organization_subscriptions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .single()

      if (subscription) {
        setBillingInfo({
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          seatCount: subscription.seat_count,
          seatsUsed: subscription.seats_used,
          stripeCustomerId: subscription.stripe_customer_id,
        })
      }
    }

    loadBillingInfo()
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Failed to open billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <div className="text-center">
          <p>Loading billing information...</p>
        </div>
      </div>
    )
  }

  const tierName = entitlements?.tier || 'FREE'
  const isFreeTier = tierName === 'FREE'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, billing information, and usage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
              <Badge
                variant={
                  billingInfo?.status === 'active' ? 'default' : 'destructive'
                }
              >
                {tierName}
              </Badge>
            </div>
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>

          {billingInfo && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="flex items-center gap-2">
                  {billingInfo.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  {billingInfo.status}
                </span>
              </div>

              {billingInfo.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Renewal Date</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 space-y-2">
            {isFreeTier ? (
              <Button onClick={() => router.push('/pricing')} className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            ) : (
              <>
                {billingInfo?.stripeCustomerId && (
                  <Button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {portalLoading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push('/pricing')}
                  className="w-full"
                >
                  View All Plans
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Usage & Seats */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Team Usage</h2>
              <p className="text-sm text-gray-600">
                Current seat utilization
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>

          {billingInfo && !isFreeTier ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Seats Used</span>
                  <span className="font-semibold">
                    {billingInfo.seatsUsed} / {billingInfo.seatCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(billingInfo.seatsUsed / billingInfo.seatCount) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {billingInfo.seatsUsed >= billingInfo.seatCount && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    You've reached your seat limit. Upgrade to add more team
                    members.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/admin/team')}
                className="w-full"
              >
                Manage Team Members
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Free tier is for individual use only
              </p>
              <Button onClick={() => router.push('/pricing')} size="sm">
                Upgrade for Team Access
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Current Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">AI Assistant</p>
              <p className="text-sm text-gray-600">
                {entitlements?.features?.ai_assistant
                  ? 'Unlimited access'
                  : 'Not available'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">AI Coach</p>
              <p className="text-sm text-gray-600">
                {entitlements?.features?.ai_coach
                  ? 'Unlimited access'
                  : 'Not available'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Export Features</p>
              <p className="text-sm text-gray-600">
                {entitlements?.features?.export_pdf ||
                entitlements?.features?.export_csv
                  ? 'Available'
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Billing History Note */}
      {!isFreeTier && billingInfo?.stripeCustomerId && (
        <Card className="mt-6 p-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> For detailed billing history, invoices, and
            payment methods, click "Manage Subscription" above to access the
            Stripe billing portal.
          </p>
        </Card>
      )}
    </div>
  )
}
