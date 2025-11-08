import { Metadata } from 'next'
import { Shield, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Compliance Reports | Admin | ABR Insights',
  description: 'Compliance monitoring and reporting'
}

export default function CompliancePage() {
  // Mock data - replace with real data fetching
  const complianceMetrics = [
    { label: 'Compliance Score', value: '98.5%', status: 'excellent', icon: CheckCircle },
    { label: 'Open Issues', value: '3', status: 'warning', icon: AlertTriangle },
    { label: 'Policies Enforced', value: '47', status: 'good', icon: Shield },
    { label: 'Last Audit', value: '2 days ago', status: 'good', icon: FileText },
  ]

  const reports = [
    {
      id: 1,
      title: 'Q4 2024 Compliance Report',
      type: 'Quarterly',
      generatedDate: '2024-10-31',
      status: 'completed',
      score: '98.5%',
      issues: 3,
    },
    {
      id: 2,
      title: 'PIPEDA Compliance Audit',
      type: 'Privacy',
      generatedDate: '2024-10-15',
      status: 'completed',
      score: '100%',
      issues: 0,
    },
    {
      id: 3,
      title: 'Security Standards Review',
      type: 'Security',
      generatedDate: '2024-10-01',
      status: 'completed',
      score: '96.2%',
      issues: 5,
    },
    {
      id: 4,
      title: 'Data Retention Policy Check',
      type: 'Policy',
      generatedDate: '2024-09-20',
      status: 'completed',
      score: '99.1%',
      issues: 1,
    },
  ]

  const openIssues = [
    {
      id: 1,
      title: 'Expired user accounts need review',
      severity: 'medium',
      category: 'User Management',
      affectedOrgs: ['Toronto Police'],
      dueDate: '2024-11-15',
    },
    {
      id: 2,
      title: 'Missing training completion records',
      severity: 'low',
      category: 'Training',
      affectedOrgs: ['Vancouver PD', 'Calgary Police'],
      dueDate: '2024-11-20',
    },
    {
      id: 3,
      title: 'Audit log retention policy update required',
      severity: 'medium',
      category: 'Security',
      affectedOrgs: ['All Organizations'],
      dueDate: '2024-11-10',
    },
  ]

  return (
    <div className="container-custom py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="mt-2 text-gray-600">
            Monitor compliance standards and generate reports
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Compliance Metrics */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {complianceMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`rounded-full p-3 ${
                  metric.status === 'excellent' ? 'bg-green-100' :
                  metric.status === 'good' ? 'bg-blue-100' :
                  'bg-yellow-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    metric.status === 'excellent' ? 'text-green-600' :
                    metric.status === 'good' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Open Issues */}
      {openIssues.length > 0 && (
        <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Open Compliance Issues</h2>
          </div>
          <div className="space-y-4">
            {openIssues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-yellow-300 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{issue.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Category: {issue.category} • Due: {issue.dueDate}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Affected: {issue.affectedOrgs.join(', ')}
                    </p>
                  </div>
                  <button className="btn-outline text-sm">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Compliance Reports</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{report.generatedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      parseFloat(report.score) >= 98 ? 'text-green-600' :
                      parseFloat(report.score) >= 95 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {report.score}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      report.issues === 0 ? 'text-green-600' :
                      report.issues <= 3 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {report.issues}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="mr-3 text-sm font-medium text-primary-600 hover:text-primary-700">
                      View
                    </button>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-700" title="Download report">
                      <Download className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
