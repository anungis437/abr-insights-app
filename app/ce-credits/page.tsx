import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  BookOpen,
  Shield,
  Download,
  ExternalLink
} from 'lucide-react'
import {
  getUserCEDashboard,
  getCECreditHistory,
  calculateCERequirements,
  formatCECredits,
  formatHours,
  getExpiryStatus
} from '@/lib/services/ce-credits'

export const metadata: Metadata = {
  title: 'CE Credits Dashboard | ABR Insights',
  description: 'Track your continuing education credits and renewal requirements'
}

export default async function CECreditsPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login?redirect=/ce-credits')
  }

  // Fetch CE dashboard data
  const dashboardData = await getUserCEDashboard(user.id)
  const history = await getCECreditHistory(user.id, undefined, 10)

  // Get regulatory bodies from summary
  const regulatoryBodies = dashboardData?.summary 
    ? Object.keys(dashboardData.summary)
    : []

  // Calculate requirements for each regulatory body
  const requirements = await Promise.all(
    regulatoryBodies.map(body => calculateCERequirements(user.id, body))
  )

  const totalStats = dashboardData?.total_stats || {
    total_certificates: 0,
    total_credits: 0,
    total_hours: 0,
    active_certificates: 0,
    expired_certificates: 0,
    regulatory_bodies: 0
  }

  const renewalAlerts = dashboardData?.renewal_alerts || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                CE Credits Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Track your continuing education credits and stay on top of renewal requirements
              </p>
            </div>
            <Link href="/certificates">
              <Button variant="outline">
                View All Certificates
              </Button>
            </Link>
          </div>
        </div>

        {/* Renewal Alerts */}
        {renewalAlerts.length > 0 && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Renewal Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {renewalAlerts.map((alert, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{alert.regulatory_body}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.certificates_expiring} {alert.certificates_expiring === 1 ? 'certificate' : 'certificates'} expiring soon
                          </p>
                          <p className="text-sm text-orange-700 mt-1">
                            {formatCECredits(alert.credits_at_risk)} at risk
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Earliest expiry: {new Date(alert.earliest_expiry).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" className="px-3 py-1.5 h-8 text-sm">
                          Renew Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalStats.total_credits.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatHours(totalStats.total_hours)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalStats.active_certificates}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalStats.total_certificates} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Regulatory Bodies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalStats.regulatory_bodies}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">
                {totalStats.expired_certificates}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Need renewal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requirements by Regulatory Body */}
        {requirements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Requirements & Progress
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requirements.map((req, index) => {
                if (!req) return null
                
                const progressPercent = Math.min(req.progress_percentage, 100)
                const isOnTrack = req.on_track
                
                return (
                  <Card key={index} className={isOnTrack ? 'border-green-200' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          {req.regulatory_body}
                        </span>
                        {isOnTrack && (
                          <span className="text-sm font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            On Track ✓
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold">{progressPercent}%</span>
                          </div>
                          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`absolute inset-0 h-full rounded-full transition-all ${
                                isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Credits Info */}
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-gray-500">Earned</p>
                            <p className="text-lg font-bold text-purple-600">
                              {req.earned_credits.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Required</p>
                            <p className="text-lg font-bold text-gray-900">
                              {req.required_credits.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining</p>
                            <p className="text-lg font-bold text-orange-600">
                              {req.remaining_credits.toFixed(1)}
                            </p>
                          </div>
                        </div>

                        {/* Cycle Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>
                            Cycle: {new Date(req.cycle_start).toLocaleDateString()} - {new Date(req.cycle_end).toLocaleDateString()}
                          </span>
                          <span>
                            {req.days_remaining} days left
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Credits by Regulatory Body */}
        {dashboardData?.summary && Object.keys(dashboardData.summary).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Credits by Regulatory Body
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(dashboardData.summary).map(([body, summary]) => (
                <Card key={body}>
                  <CardHeader>
                    <CardTitle className="text-lg">{body}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Credits</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {summary.total_credits.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Hours</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {summary.total_hours.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Certificates</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.active_certificates}
                          </p>
                        </div>
                      </div>

                      {/* Expiring Soon Warning */}
                      {summary.expiring_soon > 0 && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-900">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            {summary.expiring_soon} {summary.expiring_soon === 1 ? 'certificate' : 'certificates'} expiring soon
                            ({formatCECredits(summary.expiring_soon_credits)})
                          </p>
                        </div>
                      )}

                      {/* Categories */}
                      {summary.categories && summary.categories.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-2">By Category</p>
                          <div className="space-y-2">
                            {summary.categories.map((cat, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">{cat.category || 'Uncategorized'}</span>
                                <span className="font-medium">{formatCECredits(cat.credits)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Credit History */}
        {history.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Recent Credit History
              </h2>
              <Link href="/certificates">
                <Button variant="outline" className="px-3 py-1.5 h-8 text-sm">
                  View All
                </Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Certificate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Regulatory Body
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Issue Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item) => {
                        const expiryStatus = getExpiryStatus(item.expiry_date, item.status)
                        
                        return (
                          <tr key={item.certificate_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <Link 
                                href={`/certificates/${item.certificate_id}`}
                                className="text-sm font-medium text-purple-600 hover:text-purple-800"
                              >
                                {item.certificate_number}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">{item.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{item.course_title || '—'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.ce_credits.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatHours(item.ce_hours)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{item.regulatory_body}</p>
                              {item.credit_category && (
                                <p className="text-xs text-gray-500">{item.credit_category}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">
                                {new Date(item.issue_date).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                expiryStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                expiryStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {expiryStatus.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {totalStats.total_certificates === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No CE Credits Yet</h3>
              <p className="text-gray-600 mb-6">
                Start earning continuing education credits by completing certification courses
              </p>
              <Link href="/courses">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
