import { Metadata } from 'next'
import { Database, Search, Filter, Download, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Data Explorer | Analytics | ABR Insights',
  description: 'Explore and analyze your data',
}

export default function DataExplorerPage() {
  // Mock data - replace with real data fetching
  const dataSets = [
    { name: 'Users', records: '12,847', lastUpdated: '5 min ago' },
    { name: 'Courses', records: '156', lastUpdated: '10 min ago' },
    { name: 'Cases', records: '3,429', lastUpdated: '2 min ago' },
    { name: 'Sessions', records: '48,294', lastUpdated: '1 min ago' },
  ]

  const sampleData = [
    {
      id: 1,
      userId: 'user_123',
      email: 'john.doe@rcmp.ca',
      role: 'Investigator',
      organization: 'RCMP Ontario',
      lastActive: '2024-11-07 14:32:15',
      coursesCompleted: 12,
      casesViewed: 45,
    },
    {
      id: 2,
      userId: 'user_456',
      email: 'jane.smith@toronto.ca',
      role: 'Analyst',
      organization: 'Toronto Police',
      lastActive: '2024-11-07 14:15:22',
      coursesCompleted: 8,
      casesViewed: 67,
    },
    {
      id: 3,
      userId: 'user_789',
      email: 'mike.johnson@vancouver.ca',
      role: 'Educator',
      organization: 'Vancouver PD',
      lastActive: '2024-11-07 13:45:10',
      coursesCompleted: 15,
      casesViewed: 23,
    },
    {
      id: 4,
      userId: 'user_234',
      email: 'sarah.williams@calgary.ca',
      role: 'Learner',
      organization: 'Calgary Police',
      lastActive: '2024-11-07 12:30:05',
      coursesCompleted: 5,
      casesViewed: 12,
    },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
          <p className="mt-2 text-gray-600">Explore and analyze your platform data</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Data Sets */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dataSets.map((dataset) => (
          <div
            key={dataset.name}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-50 p-3">
                <Database className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{dataset.name}</p>
                <p className="text-2xl font-bold text-gray-900">{dataset.records}</p>
                <p className="text-xs text-gray-500">Updated {dataset.lastUpdated}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Query Builder */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Query Builder</h2>

        <div className="space-y-4">
          {/* Data Source */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="dataSource" className="mb-2 block text-sm font-medium text-gray-700">
                Data Source
              </label>
              <select id="dataSource" className="input w-full" aria-label="Select data source">
                <option value="users">Users</option>
                <option value="courses">Courses</option>
                <option value="cases">Cases</option>
                <option value="sessions">Sessions</option>
                <option value="analytics">Analytics Events</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeRange" className="mb-2 block text-sm font-medium text-gray-700">
                Time Range
              </label>
              <select id="timeRange" className="input w-full" aria-label="Select time range">
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="search" placeholder="Search data..." className="input w-full pl-10" />
              </div>
            </div>
            <button className="btn-outline flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Add Filter
            </button>
            <button className="btn-primary">Run Query</button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Query Results</h2>
              <p className="text-sm text-gray-600">Showing {sampleData.length} of 12,847 results</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="input text-sm" aria-label="Results per page">
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    aria-label="Select all rows"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cases
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sampleData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      aria-label={`Select ${row.email}`}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{row.userId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.organization}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {row.lastActive}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {row.coursesCompleted}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{row.casesViewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1-4</span> of{' '}
              <span className="font-medium">12,847</span> results
            </p>
            <div className="flex gap-2">
              <button className="btn-outline" disabled>
                Previous
              </button>
              <button className="btn-outline">1</button>
              <button className="btn-outline">2</button>
              <button className="btn-outline">3</button>
              <span className="flex items-center px-2">...</span>
              <button className="btn-outline">128</button>
              <button className="btn-primary">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
