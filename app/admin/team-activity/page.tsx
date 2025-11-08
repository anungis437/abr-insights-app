import { Metadata } from 'next'
import { Activity, Users, Eye, Download, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Team Activity | Admin | ABR Insights',
  description: 'Monitor team member activity and usage'
}

export default function TeamActivityPage() {
  // Mock data - replace with real data fetching
  const activityStats = [
    { label: 'Active Users (24h)', value: '892', icon: Users },
    { label: 'Total Sessions', value: '1,247', icon: Activity },
    { label: 'Avg Session Time', value: '42 min', icon: Clock },
    { label: 'Page Views', value: '18,429', icon: Eye },
  ]

  const teamActivity = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        email: 'john.doe@rcmp.ca',
        role: 'Investigator',
        avatar: 'JD',
      },
      lastActive: '2 minutes ago',
      sessionsToday: 3,
      coursesAccessed: 5,
      casesViewed: 12,
      status: 'online',
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        email: 'jane.smith@toronto.ca',
        role: 'Analyst',
        avatar: 'JS',
      },
      lastActive: '15 minutes ago',
      sessionsToday: 2,
      coursesAccessed: 3,
      casesViewed: 8,
      status: 'online',
    },
    {
      id: 3,
      user: {
        name: 'Mike Johnson',
        email: 'mike.johnson@vancouver.ca',
        role: 'Educator',
        avatar: 'MJ',
      },
      lastActive: '1 hour ago',
      sessionsToday: 4,
      coursesAccessed: 8,
      casesViewed: 3,
      status: 'away',
    },
    {
      id: 4,
      user: {
        name: 'Sarah Williams',
        email: 'sarah.williams@calgary.ca',
        role: 'Learner',
        avatar: 'SW',
      },
      lastActive: '3 hours ago',
      sessionsToday: 1,
      coursesAccessed: 2,
      casesViewed: 1,
      status: 'offline',
    },
    {
      id: 5,
      user: {
        name: 'David Brown',
        email: 'david.brown@rcmp.ca',
        role: 'Compliance Officer',
        avatar: 'DB',
      },
      lastActive: '5 minutes ago',
      sessionsToday: 2,
      coursesAccessed: 1,
      casesViewed: 15,
      status: 'online',
    },
  ]

  const recentActions = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Completed course',
      target: 'Advanced Investigation Techniques',
      time: '2 minutes ago',
      type: 'course',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'Generated report',
      target: 'Case Analysis Report Q4',
      time: '15 minutes ago',
      type: 'report',
    },
    {
      id: 3,
      user: 'David Brown',
      action: 'Flagged case',
      target: 'Case #2847',
      time: '20 minutes ago',
      type: 'case',
    },
    {
      id: 4,
      user: 'Mike Johnson',
      action: 'Published course',
      target: 'Ethics in Law Enforcement',
      time: '45 minutes ago',
      type: 'course',
    },
    {
      id: 5,
      user: 'Sarah Williams',
      action: 'Started course',
      target: 'Criminal Psychology Basics',
      time: '1 hour ago',
      type: 'course',
    },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Activity</h1>
          <p className="mt-2 text-gray-600">
            Monitor team member activity and usage patterns
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Activity Report
        </button>
      </div>

      {/* Activity Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {activityStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary-50 p-3">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Team Members Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Team Members</h2>
          <div className="space-y-4">
            {teamActivity.map((member) => (
              <div key={member.id} className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-semibold">
                        {member.user.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user.name}</p>
                      <p className="text-sm text-gray-600">{member.user.role}</p>
                      <p className="text-xs text-gray-500">{member.lastActive}</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View Details
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-600">Sessions</p>
                    <p className="font-semibold text-gray-900">{member.sessionsToday}</p>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-600">Courses</p>
                    <p className="font-semibold text-gray-900">{member.coursesAccessed}</p>
                  </div>
                  <div className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-600">Cases</p>
                    <p className="font-semibold text-gray-900">{member.casesViewed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Actions</h2>
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0">
                <div className={`mt-1 rounded-full p-2 ${
                  action.type === 'course' ? 'bg-purple-100' :
                  action.type === 'report' ? 'bg-blue-100' :
                  'bg-orange-100'
                }`}>
                  <Activity className={`h-4 w-4 ${
                    action.type === 'course' ? 'text-purple-600' :
                    action.type === 'report' ? 'text-blue-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{action.user}</span> {action.action}
                  </p>
                  <p className="mt-1 text-sm font-medium text-primary-600">{action.target}</p>
                  <p className="mt-1 text-xs text-gray-500">{action.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
