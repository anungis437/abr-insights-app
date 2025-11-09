import { Metadata } from 'next'
import { Building2, Users, GraduationCap, FileText, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard | ABR Insights',
  description: 'Platform administration dashboard'
}

export default function AdminDashboardPage() {
  // Mock data - replace with real data fetching
  const stats = [
    { label: 'Total Organizations', value: '248', change: '+12%', icon: Building2, color: 'text-blue-600' },
    { label: 'Active Users', value: '12,847', change: '+8%', icon: Users, color: 'text-green-600' },
    { label: 'Total Courses', value: '156', change: '+5%', icon: GraduationCap, color: 'text-purple-600' },
    { label: 'Cases Analyzed', value: '3,429', change: '+15%', icon: FileText, color: 'text-orange-600' },
    { label: 'AI Requests (24h)', value: '48,294', change: '+22%', icon: Activity, color: 'text-indigo-600' },
    { label: 'System Health', value: '99.8%', change: '+0.1%', icon: TrendingUp, color: 'text-emerald-600' },
  ]

  const recentActivities = [
    { org: 'RCMP Ontario', action: 'New organization created', time: '5 minutes ago', type: 'success' },
    { org: 'Toronto Police', action: 'Bulk user import completed', time: '12 minutes ago', type: 'info' },
    { org: 'System', action: 'Database backup completed', time: '1 hour ago', type: 'success' },
    { org: 'Vancouver PD', action: 'AI model training started', time: '2 hours ago', type: 'warning' },
    { org: 'System', action: 'Security scan completed', time: '3 hours ago', type: 'success' },
  ]

  return (
    <div className="container-custom pt-20 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage the entire ABR Insights platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-green-600">{stat.change} from last month</p>
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
          <a
            href="/admin/users"
            className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <Users className="mb-2 h-5 w-5 text-green-600" />
            <p className="font-medium text-gray-900">Manage Users</p>
          </a>
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
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
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
      </div>
    </div>
  )
}
