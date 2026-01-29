import { Metadata } from 'next'
import { FileText, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Report | Analytics | ABR Insights',
  description: 'Create custom analytics reports',
}

export default function AnalyticsCreatePage() {
  const reportTemplates = [
    {
      id: 1,
      name: 'User Activity Report',
      description: 'Track user engagement and activity patterns',
      icon: BarChart3,
      metrics: ['Active users', 'Session duration', 'Page views', 'Feature usage'],
    },
    {
      id: 2,
      name: 'Learning Progress Report',
      description: 'Monitor course completion and learning outcomes',
      icon: TrendingUp,
      metrics: ['Course completions', 'Quiz scores', 'Time to complete', 'Certification rates'],
    },
    {
      id: 3,
      name: 'Case Analysis Report',
      description: 'Analyze case processing and outcomes',
      icon: FileText,
      metrics: ['Cases created', 'Resolution time', 'Status distribution', 'AI usage'],
    },
    {
      id: 4,
      name: 'Custom Report',
      description: 'Build a custom report with your own metrics',
      icon: PieChart,
      metrics: ['Choose your own metrics', 'Custom date ranges', 'Advanced filters'],
    },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Analytics Report</h1>
        <p className="mt-2 text-gray-600">Generate custom reports to analyze your data</p>
      </div>

      {/* Report Templates */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Choose a Report Template</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {reportTemplates.map((template) => {
            const Icon = template.icon
            return (
              <div
                key={template.id}
                className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-600 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary-50 p-3">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                </div>
                <p className="mb-4 text-sm text-gray-600">{template.description}</p>
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Included Metrics:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn-primary w-full">Use This Template</button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Or Build a Custom Report</h2>

        <div className="space-y-6">
          {/* Report Name */}
          <div>
            <label htmlFor="reportName" className="mb-2 block text-sm font-medium text-gray-700">
              Report Name *
            </label>
            <input
              type="text"
              id="reportName"
              className="input w-full"
              placeholder="Enter report name"
            />
          </div>

          {/* Date Range */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="date" id="startDate" className="input w-full pl-10" />
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="date" id="endDate" className="input w-full pl-10" />
              </div>
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Select Metrics *</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                'Active Users',
                'Session Duration',
                'Course Completions',
                'Cases Created',
                'AI Requests',
                'User Growth',
                'Engagement Rate',
                'Feature Usage',
                'Error Rate',
              ].map((metric) => (
                <label key={metric} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label htmlFor="filters" className="mb-2 block text-sm font-medium text-gray-700">
              Filters (Optional)
            </label>
            <select id="filters" className="input w-full" aria-label="Select filters">
              <option value="">No filters</option>
              <option value="org">By Organization</option>
              <option value="role">By User Role</option>
              <option value="status">By Status</option>
            </select>
          </div>

          {/* Output Format */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Output Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="format" value="pdf" defaultChecked />
                <span className="text-sm text-gray-700">PDF</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="format" value="excel" />
                <span className="text-sm text-gray-700">Excel</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="format" value="csv" />
                <span className="text-sm text-gray-700">CSV</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t border-gray-200 pt-6">
            <button className="btn-primary flex-1">Generate Report</button>
            <button className="btn-outline flex-1">Save as Template</button>
          </div>
        </div>
      </div>
    </div>
  )
}
