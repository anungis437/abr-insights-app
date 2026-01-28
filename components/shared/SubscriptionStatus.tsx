'use client'

import { useState } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { Loader2, Crown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SubscriptionBadge() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
        <span className="text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!subscription) return null

  const badgeConfig = {
    free: {
      icon: CheckCircle2,
      text: 'Free',
      className: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-500',
    },
    professional: {
      icon: Crown,
      text: 'Pro',
      className: 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700',
      iconColor: 'text-purple-600',
    },
    enterprise: {
      icon: Crown,
      text: 'Enterprise',
      className: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700',
      iconColor: 'text-amber-600',
    },
  }

  const config = badgeConfig[subscription.tier]
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', config.className)}>
      <Icon className={cn('h-4 w-4', config.iconColor)} />
      <span>{config.text}</span>
    </div>
  )
}

export function SubscriptionStatus() {
  const { subscription, loading, openCustomerPortal } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!subscription) return null

  const handleManage = async () => {
    try {
      setIsLoading(true)
      await openCustomerPortal()
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      text: 'Active',
      className: 'text-green-600',
    },
    trialing: {
      icon: CheckCircle2,
      text: 'Trial',
      className: 'text-blue-600',
    },
    past_due: {
      icon: AlertCircle,
      text: 'Past Due',
      className: 'text-red-600',
    },
    canceled: {
      icon: AlertCircle,
      text: 'Canceled',
      className: 'text-gray-600',
    },
    incomplete: {
      icon: AlertCircle,
      text: 'Incomplete',
      className: 'text-yellow-600',
    },
    incomplete_expired: {
      icon: AlertCircle,
      text: 'Expired',
      className: 'text-red-600',
    },
    unpaid: {
      icon: AlertCircle,
      text: 'Unpaid',
      className: 'text-red-600',
    },
  }

  const config = statusConfig[subscription.status]
  const StatusIcon = config.icon

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
          <div className="mt-2 flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', config.className)} />
            <span className={cn('text-sm font-medium', config.className)}>
              {config.text}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
          </div>
          {subscription.currentPeriodEnd && subscription.isActive && (
            <p className="mt-1 text-sm text-gray-500">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {subscription.stripeCustomerId && (
        <div className="mt-4">
          <Button
            onClick={handleManage}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
