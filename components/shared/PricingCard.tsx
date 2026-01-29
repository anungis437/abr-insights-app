'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  name: string
  price: string
  billing: string
  description: string
  features: Array<{ text: string; included: boolean }>
  ctaText: string
  tier: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE'
  popular?: boolean
  contactSales?: boolean
}

export function PricingCard({
  name,
  price,
  billing,
  description,
  features,
  ctaText,
  tier,
  popular = false,
  contactSales = false,
}: PricingCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { subscription, createCheckoutSession } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!user) {
      router.push(`/auth/signup?plan=${tier.toLowerCase()}`)
      return
    }

    if (contactSales) {
      router.push('/contact?plan=enterprise')
      return
    }

    try {
      setLoading(true)
      await createCheckoutSession(tier)
    } catch (error) {
      console.error('Error starting checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isCurrentPlan = subscription?.tier === tier.toLowerCase()
  const canUpgrade = subscription && !isCurrentPlan

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 bg-white p-8 shadow-lg transition-all hover:shadow-xl',
        popular ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200'
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline">
          <span className="text-5xl font-extrabold text-gray-900">{price}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{billing}</p>
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0 text-gray-300" />
            )}
            <span className={cn('text-sm', feature.included ? 'text-gray-700' : 'text-gray-400')}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleClick}
        disabled={loading || isCurrentPlan}
        className={cn(
          'w-full',
          popular
            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'
            : ''
        )}
        variant={popular ? 'default' : 'outline'}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : canUpgrade ? (
          'Upgrade'
        ) : (
          ctaText
        )}
      </Button>

      {isCurrentPlan && subscription?.stripeCustomerId && (
        <p className="mt-4 text-center text-xs text-gray-500">
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="text-primary-600 hover:underline"
          >
            Manage subscription
          </button>
        </p>
      )}
    </div>
  )
}
