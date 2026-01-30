'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getSSOProvider,
  getActiveSessions,
  revokeSession,
  getSSOLoginAttempts,
  type SSOProvider,
  type EnterpriseSession,
} from '@/lib/services/sso'
import {
  Shield,
  ArrowLeft,
  Users,
  Clock,
  Globe,
  Monitor,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react'

export default function SSOSessionsPage() {
  const router = useRouter()
  const params = useParams()
  const providerId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [provider, setProvider] = useState<SSOProvider | null>(null)
  const [sessions, setSessions] = useState<EnterpriseSession[]>([])
  const [loginAttempts, setLoginAttempts] = useState<any[]>([])
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({})

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()

      if (!profile?.organizations?.id) {
        router.push('/dashboard')
        return
      }

      setOrganizationId(profile.organizations.id)

      // Load provider
      const providerData = await getSSOProvider(providerId)
      setProvider(providerData)

      // Load active sessions
      const sessionsData = await getActiveSessions(profile.organizations.id)
      const providerSessions = sessionsData.filter((s) => s.sso_provider_id === providerId)
      setSessions(providerSessions)

      // Load user profiles for sessions
      if (providerSessions.length > 0) {
        const userIds = [...new Set(providerSessions.map((s) => s.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)

        const profileMap: Record<string, any> = {}
        profiles?.forEach((p) => {
          profileMap[p.id] = p
        })
        setUserProfiles(profileMap)
      }

      // Load recent login attempts
      const attemptsData = await getSSOLoginAttempts(profile.organizations.id)
      const providerAttempts = attemptsData.filter((a) => a.sso_provider_id === providerId)
      setLoginAttempts(providerAttempts.slice(0, 20))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, providerId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? The user will be logged out.')) {
      return
    }

    try {
      await revokeSession(sessionId)
      await loadData()
    } catch (error) {
      console.error('Failed to revoke session:', error)
      alert('Failed to revoke session')
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getTimeSince = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Provider Not Found</h2>
          <button
            onClick={() => router.push('/admin/sso')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to SSO Providers
          </button>
        </div>
      </div>
    )
  }

  const activeSessionCount = sessions.length
  const uniqueUsers = new Set(sessions.map((s) => s.user_id)).size
  const recentLogins = loginAttempts.filter(
    (a) => a.success && new Date(a.attempted_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/sso')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to SSO Providers
          </button>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
              <p className="text-gray-600">Session Management</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{activeSessionCount}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Logins (24h)</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{recentLogins}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No active sessions</h3>
              <p className="mt-2 text-gray-600">
                There are currently no active SSO sessions for this provider.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {userProfiles[session.user_id]?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userProfiles[session.user_id]?.email || session.user_id}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {session.last_activity_at
                          ? getTimeSince(session.last_activity_at)
                          : 'Never'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Globe className="h-4 w-4 text-gray-400" />
                          {session.ip_address || 'Unknown'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(session.expires_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Login Attempts */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Login Attempts</h2>
          </div>

          {loginAttempts.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No login attempts</h3>
              <p className="mt-2 text-gray-600">No recent SSO login attempts for this provider.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Attempted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loginAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        {attempt.success ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {attempt.email || 'Unknown'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(attempt.attempted_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Globe className="h-4 w-4 text-gray-400" />
                          {attempt.ip_address || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {attempt.error_message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
