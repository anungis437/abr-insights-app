'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { BarChart3, Lock, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'

type PlanTier = 'free' | 'professional' | 'enterprise'

export default function AnalyticsPage() {
  const { profile } = useAuth()
  const userPlan: PlanTier = (profile?.subscription_tier as PlanTier) || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      <section className="border-b border-gray-200 bg-white px-4 py-12">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <BarChart3 className="mx-auto mb-4 h-16 w-16 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Premium Analytics</h1>
            <p className="mb-8 text-xl text-gray-600">
              Unlock powerful insights with our Professional or Enterprise plans
            </p>
            <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              View Plans
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Available with Premium Plans
              </h2>
              <div className="space-y-4">
                <FeatureItem
                  icon={CheckCircle}
                  text="Advanced learning insights"
                  plan="Professional"
                />
                <FeatureItem
                  icon={CheckCircle}
                  text="Skill development tracking"
                  plan="Professional"
                />
                <FeatureItem icon={CheckCircle} text="Export to PDF/CSV" plan="Professional" />
                <FeatureItem
                  icon={CheckCircle}
                  text="Team performance analytics"
                  plan="Enterprise"
                />
                <FeatureItem
                  icon={CheckCircle}
                  text="Organization-wide dashboards"
                  plan="Enterprise"
                />
                <FeatureItem
                  icon={CheckCircle}
                  text="Predictive outcome analytics"
                  plan="Enterprise"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureItem({ icon: Icon, text, plan }: { icon: any; text: string; plan: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-green-600" />
        <span className="text-gray-900">{text}</span>
      </div>
      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
        {plan}
      </span>
    </div>
  )
}
