'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { useEntitlements } from '@/hooks/use-entitlements'
import { Users, Lock, Sparkles, CheckCircle } from 'lucide-react'

export default function TeamPage() {
  const { user, profile, loading } = useAuth()
  const { entitlements, loading: entitlementsLoading } = useEntitlements()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/team')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  // Check if user has team management features (available on higher tiers)
  const hasPermission =
    profile?.role === 'admin' ||
    profile?.role === 'team_lead' ||
    (entitlements?.features.maxOrganizationMembers ?? 1) > 1

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
        <section className="border-b border-gray-200 bg-white px-4 py-12">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl text-center">
              <Lock className="mx-auto mb-4 h-16 w-16 text-amber-600" />
              <h1 className="mb-4 text-4xl font-bold text-gray-900">Team Management</h1>
              <p className="mb-2 text-xl text-gray-600">Enterprise Feature</p>
              <p className="mb-8 text-gray-500">
                Upgrade to Enterprise to unlock powerful team collaboration tools
              </p>
              <Link href="/pricing" className="btn-primary inline-flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                View Enterprise Plan
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Enterprise Features</h2>
                <div className="space-y-4">
                  <FeatureItem text="Unlimited team members" />
                  <FeatureItem text="Role-based permissions" />
                  <FeatureItem text="Bulk invitations" />
                  <FeatureItem text="Custom roles & departments" />
                  <FeatureItem text="Team analytics dashboard" />
                  <FeatureItem text="Audit logs & compliance" />
                  <FeatureItem text="Organization-wide reporting" />
                  <FeatureItem text="Dedicated support" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-custom px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Team Management</h1>
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">Coming Soon</h2>
          <p className="text-gray-500">Team management features are under development.</p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <span className="text-gray-900">{text}</span>
    </div>
  )
}
