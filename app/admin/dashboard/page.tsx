import { Metadata } from 'next'
import { Building2, Users, GraduationCap, FileText, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin Dashboard | ABR Insights',
  description: 'Platform administration dashboard',
}

async function getAdminStats() {
  const supabase = await createClient()

  // Get counts from database
  const [
    { count: orgsCount },
    { count: usersCount },
    { count: coursesCount },
    { count: casesCount },
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('tribunal_cases').select('*', { count: 'exact', head: true }),
  ])

  // Get AI usage in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: aiRequestsCount } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneDayAgo)

  return {
    organizations: orgsCount || 0,
    users: usersCount || 0,
    courses: coursesCount || 0,
    cases: casesCount || 0,
    aiRequests: aiRequestsCount || 0,
  }
}

async function getRecentActivity() {
  const supabase = await createClient()

  // Get recent audit logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!logs || logs.length === 0) {
    return []
  }

  return logs.map((log) => {
    const timeAgo = getTimeAgo(new Date(log.created_at))
    const type =
      log.action.includes('create') || log.action.includes('success')
        ? 'success'
        : log.action.includes('fail') || log.action.includes('error')
          ? 'warning'
          : 'info'

    return {
      org: log.user_id ? 'User Action' : 'System',
      action: log.action.replace(/_/g, ' '),
      time: timeAgo,
      type,
    }
  })
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const recentActivities = await getRecentActivity()

  const statsConfig = [
    {
      label: 'Total Organizations',
      value: stats.organizations.toLocaleString(),
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      label: 'Active Users',
      value: stats.users.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
    },
    {
      label: 'Total Courses',
      value: stats.courses.toLocaleString(),
      icon: GraduationCap,
      color: 'text-purple-600',
    },
    {
      label: 'Cases in Database',
      value: stats.cases.toLocaleString(),
      icon: FileText,
      color: 'text-orange-600',
    },
    {
      label: 'AI Requests (24h)',
      value: stats.aiRequests.toLocaleString(),
      icon: Activity,
      color: 'text-indigo-600',
    },
    {
      label: 'System Health',
      value: '99.8%',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
  ]

  return (
    <div className="container-custom pb-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
        <p className="mt-2 text-gray-600">Monitor and manage the entire ABR Insights platform</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full bg-gray-50 p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/organizations"
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Building2 className="mb-2 h-5 w-5 text-blue-600" />
            <p className="font-medium text-gray-900">Manage Organizations</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Users className="mb-2 h-5 w-5 text-green-600" />
            <p className="font-medium text-gray-900">Manage Users</p>
          </Link>
          <a
            href="/admin/courses"
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <GraduationCap className="mb-2 h-5 w-5 text-purple-600" />
            <p className="font-medium text-gray-900">Manage Courses</p>
          </a>
          <a
            href="/admin/analytics"
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <TrendingUp className="mb-2 h-5 w-5 text-orange-600" />
            <p className="font-medium text-gray-900">View Analytics</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{activity.org}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  )
}
