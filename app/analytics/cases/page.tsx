import { Metadata } from 'next'
import { FileText, TrendingUp, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Case Analytics | Analytics | ABR Insights',
  description: 'Analyze case processing and outcomes'
}

export default function CaseAnalyticsPage() {
  // Mock data - replace with real data fetching
  const stats = [
    { label: 'Total Cases', value: '3,429', change: '+15%', icon: FileText, trend: 'up' },
    { label: 'Avg Resolution Time', value: '4.2 days', change: '-8%', icon: Clock, trend: 'down' },
    { label: 'Active Cases', value: '247', change: '+3%', icon: TrendingUp, trend: 'up' },
    { label: 'Cases per Analyst', value: '12.4', change: '+5%', icon: Users, trend: 'up' },
  ]

  const casesByStatus = [
    { status: 'Open', count: 147, percentage: 43, color: 'bg-blue-500' },
    { status: 'In Progress', count: 100, percentage: 29, color: 'bg-yellow-500' },
    { status: 'Resolved', count: 2847, percentage: 83, color: 'bg-green-500' },
    { status: 'Closed', count: 335, percentage: 10, color: 'bg-gray-500' },
  ]

  const topCategories = [
    { category: 'Financial Crime', cases: 1247, percentage: 36 },
    { category: 'Drug Offenses', cases: 856, percentage: 25 },
    { category: 'Cybercrime', cases: 542, percentage: 16 },
    { category: 'Organized Crime', cases: 398, percentage: 12 },
    { category: 'Other', cases: 386, percentage: 11 },
  ]

  const recentActivity = [
    {
      id: 1,
      caseId: 'CASE-2847',
      title: 'Financial fraud investigation',
      analyst: 'Jane Smith',
      action: 'Case closed',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      caseId: 'CASE-2846',
      title: 'Drug trafficking network',
      analyst: 'John Doe',
      action: 'Evidence added',
      time: '15 minutes ago',
      status: 'progress',
    },
    {
      id: 3,
      caseId: 'CASE-2845',
      title: 'Identity theft ring',
      analyst: 'Mike Johnson',
      action: 'Case assigned',
      time: '1 hour ago',
      status: 'progress',
    },
    {
      id: 4,
      caseId: 'CASE-2844',
      title: 'Organized crime operation',
      analyst: 'Sarah Williams',
      action: 'Investigation started',
      time: '2 hours ago',
      status: 'progress',
    },
  ]

  const performanceMetrics = [
    { metric: 'Cases Opened (30d)', value: '342', target: '300', status: 'above' },
    { metric: 'Cases Closed (30d)', value: '298', target: '280', status: 'above' },
    { metric: 'Avg Response Time', value: '2.1h', target: '3h', status: 'above' },
    { metric: 'Case Backlog', value: '89', target: '<100', status: 'above' },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Case Analytics</h1>
        <p className="mt-2 text-gray-600">
          Analyze case processing, trends, and outcomes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`mt-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="rounded-full bg-gray-50 p-3">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Cases by Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Cases by Status</h2>
          <div className="space-y-4">
            {casesByStatus.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{item.status}</span>
                  <span className="text-gray-600">{item.count} cases</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-3 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Top Case Categories</h2>
          <div className="space-y-4">
            {topCategories.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <span className="text-gray-600">{item.cases} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-primary-600"
                      style={{ width: `${item.percentage * 3}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Performance Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.metric} className="rounded-lg border border-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                {metric.status === 'above' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="mt-1 text-xs text-gray-500">Target: {metric.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Case Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${
                  activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    activity.status === 'success' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-primary-600">
                      {activity.caseId}
                    </span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-900">{activity.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {activity.action} by {activity.analyst}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
