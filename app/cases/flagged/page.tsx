import { Metadata } from 'next'
import { AlertTriangle, Flag, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Flagged Cases | Cases | ABR Insights',
  description: 'Review and manage flagged cases requiring attention',
}

export default function FlaggedCasesPage() {
  // Mock data - replace with real data fetching
  const stats = [
    { label: 'Total Flagged', value: '47', change: '-12%', icon: Flag, trend: 'down' },
    { label: 'High Priority', value: '12', change: '+3', icon: AlertTriangle, trend: 'up' },
    { label: 'Pending Review', value: '23', change: '-5', icon: Clock, trend: 'down' },
    { label: 'Resolved Today', value: '8', change: '+2', icon: CheckCircle, trend: 'up' },
  ]

  const flaggedCases = [
    {
      id: 1,
      caseId: 'CASE-2847',
      title: 'Suspicious financial transaction pattern',
      flaggedBy: 'System Auto-Detection',
      flaggedAt: '2024-01-15 09:24',
      severity: 'high',
      reason: 'Multiple large cash deposits from unknown sources',
      assignee: 'Jane Smith',
      status: 'under_review',
      daysOpen: 2,
    },
    {
      id: 2,
      caseId: 'CASE-2843',
      title: 'Data access violation detected',
      flaggedBy: 'Mike Johnson',
      flaggedAt: '2024-01-14 16:45',
      severity: 'critical',
      reason: 'Unauthorized access to sensitive case files',
      assignee: 'Sarah Williams',
      status: 'investigating',
      daysOpen: 3,
    },
    {
      id: 3,
      caseId: 'CASE-2839',
      title: 'Potential evidence tampering',
      flaggedBy: 'System Auto-Detection',
      flaggedAt: '2024-01-14 11:20',
      severity: 'high',
      reason: 'Evidence log timestamps inconsistent',
      assignee: 'John Doe',
      status: 'under_review',
      daysOpen: 3,
    },
    {
      id: 4,
      caseId: 'CASE-2835',
      title: 'Policy compliance violation',
      flaggedBy: 'Sarah Williams',
      flaggedAt: '2024-01-13 14:30',
      severity: 'medium',
      reason: 'Case notes not updated within required timeframe',
      assignee: 'Mike Johnson',
      status: 'pending_review',
      daysOpen: 4,
    },
    {
      id: 5,
      caseId: 'CASE-2831',
      title: 'Unusual case progression pattern',
      flaggedBy: 'System Auto-Detection',
      flaggedAt: '2024-01-12 10:15',
      severity: 'medium',
      reason: 'Case moved through stages faster than normal',
      assignee: 'Jane Smith',
      status: 'pending_review',
      daysOpen: 5,
    },
  ]

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return styles[severity as keyof typeof styles] || styles.medium
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      investigating: 'bg-purple-100 text-purple-800 border-purple-200',
      pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return styles[status as keyof typeof styles] || styles.pending_review
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      under_review: 'Under Review',
      investigating: 'Investigating',
      pending_review: 'Pending Review',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flagged Cases</h1>
        <p className="mt-2 text-gray-600">
          Review and manage cases that require compliance attention
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
                  <p
                    className={`mt-1 text-sm ${
                      stat.trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {stat.change} from yesterday
                  </p>
                </div>
                <div
                  className={`rounded-full p-3 ${
                    stat.label === 'High Priority' ? 'bg-red-50' : 'bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      stat.label === 'High Priority' ? 'text-red-600' : 'text-primary-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert Banner */}
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">12 High Priority Cases</h3>
            <p className="mt-1 text-sm text-red-700">
              These cases require immediate attention from compliance officers. Cases flagged for
              more than 7 days will be escalated.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search flagged cases..."
          className="min-w-[250px] flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          aria-label="Search flagged cases"
        />
        <select
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="under_review">Under Review</option>
          <option value="investigating">Investigating</option>
          <option value="pending_review">Pending Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <button className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
          Apply Filters
        </button>
      </div>

      {/* Flagged Cases Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Flagged By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Days Open
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {flaggedCases.map((flaggedCase) => (
                <tr key={flaggedCase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-red-500" />
                        <span className="font-mono text-sm font-medium text-primary-600">
                          {flaggedCase.caseId}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{flaggedCase.title}</p>
                      <p className="text-xs text-gray-500">{flaggedCase.flaggedAt}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getSeverityBadge(flaggedCase.severity)}`}
                    >
                      {flaggedCase.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs text-sm text-gray-900">{flaggedCase.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{flaggedCase.flaggedBy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{flaggedCase.assignee}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(flaggedCase.status)}`}
                    >
                      {getStatusLabel(flaggedCase.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        flaggedCase.daysOpen >= 7
                          ? 'text-red-600'
                          : flaggedCase.daysOpen >= 5
                            ? 'text-orange-600'
                            : 'text-gray-900'
                      }`}
                    >
                      {flaggedCase.daysOpen} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md bg-primary-600 p-2 text-white hover:bg-primary-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                        title="Resolve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                        title="Dismiss"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Showing 1 to 5 of 47 flagged cases</span>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
