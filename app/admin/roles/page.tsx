'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Plus } from 'lucide-react'

export default function AdminRolesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['super_admin', 'org_admin'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
              <p className="mt-2 text-gray-600">Manage roles and their associated permissions</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700">
              <Plus className="h-5 w-5" />
              Create Role
            </button>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Role Management</h3>
            <p className="mb-4 text-gray-600">Advanced role management features are coming soon.</p>
            <p className="text-sm text-gray-500">
              In the meantime, use the{' '}
              <button
                onClick={() => router.push('/admin/permissions')}
                className="text-primary-600 hover:underline"
              >
                Permissions page
              </button>{' '}
              to manage access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
