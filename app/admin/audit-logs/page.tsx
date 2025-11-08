import { Metadata } from 'next'
import { Shield, Search, Download, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Audit Logs | Admin | ABR Insights',
  description: 'System audit logs and security monitoring'
}

export default function AuditLogsPage() {
  // Mock data - replace with real data fetching
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-11-07 14:32:15',
      user: 'john.doe@rcmp.ca',
      action: 'User Login',
      resource: 'Authentication',
      ipAddress: '192.168.1.45',
      status: 'success',
      details: 'Successful login from Ontario',
    },
    {
      id: 2,
      timestamp: '2024-11-07 14:28:42',
      user: 'admin@abr-insights.com',
      action: 'User Created',
      resource: 'User Management',
      ipAddress: '10.0.0.1',
      status: 'success',
      details: 'Created user: jane.smith@toronto.ca',
    },
    {
      id: 3,
      timestamp: '2024-11-07 14:15:33',
      user: 'investigator@vancouver.ca',
      action: 'Case Accessed',
      resource: 'Case #2847',
      ipAddress: '172.16.0.88',
      status: 'success',
      details: 'Viewed case details and documents',
    },
    {
      id: 4,
      timestamp: '2024-11-07 13:52:18',
      user: 'compliance@rcmp.ca',
      action: 'Report Generated',
      resource: 'Compliance Report',
      ipAddress: '192.168.1.67',
      status: 'success',
      details: 'Generated quarterly compliance report',
    },
    {
      id: 5,
      timestamp: '2024-11-07 13:45:09',
      user: 'unknown@external.com',
      action: 'Login Attempt',
      resource: 'Authentication',
      ipAddress: '203.0.113.45',
      status: 'failed',
      details: 'Invalid credentials - 3 failed attempts',
    },
    {
      id: 6,
      timestamp: '2024-11-07 13:22:41',
      user: 'educator@toronto.ca',
      action: 'Course Published',
      resource: 'Course #156',
      ipAddress: '192.168.2.34',
      status: 'success',
      details: 'Published "Advanced Investigation Techniques"',
    },
    {
      id: 7,
      timestamp: '2024-11-07 12:58:27',
      user: 'admin@abr-insights.com',
      action: 'Settings Changed',
      resource: 'System Settings',
      ipAddress: '10.0.0.1',
      status: 'success',
      details: 'Updated session timeout to 30 minutes',
    },
    {
      id: 8,
      timestamp: '2024-11-07 12:33:15',
      user: 'analyst@calgary.ca',
      action: 'Data Export',
      resource: 'Analytics Data',
      ipAddress: '172.16.1.92',
      status: 'success',
      details: 'Exported case analytics for Q3 2024',
    },
  ]

  const stats = [
    { label: 'Total Events (24h)', value: '8,247' },
    { label: 'Failed Logins', value: '23' },
    { label: 'Security Alerts', value: '2' },
    { label: 'Active Sessions', value: '1,847' },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">
            Monitor system activity and security events
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search logs..."
                className="input w-full pl-10"
              />
            </div>
          </div>
          <select className="input" aria-label="Filter by action type">
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="access">Access</option>
          </select>
          <select className="input" aria-label="Filter by status">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="warning">Warning</option>
          </select>
          <button className="btn-outline flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{log.action}</span>
                    <p className="text-sm text-gray-500">{log.details}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">1-8</span> of <span className="font-medium">8,247</span> results
        </p>
        <div className="flex gap-2">
          <button className="btn-outline" disabled>
            Previous
          </button>
          <button className="btn-primary">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
