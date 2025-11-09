import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Download, Eye, Search, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Certificate Management | Admin | ABR Insights',
  description: 'Manage certificates and digital badges',
}

interface Certificate {
  id: string
  certificate_number: string
  certificate_type: string
  status: string
  title: string
  recipient_name: string
  issue_date: string
  expiry_date: string | null
  ce_credits: number | null
  user_id: string
  course_id: string | null
  pdf_url: string | null
  user?: {
    email: string
  }
  course?: {
    title: string
  }
}

async function getCertificates() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      user:users(email),
      course:courses(title)
    `)
    .order('issue_date', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching certificates:', error)
    return []
  }

  return data as any as Certificate[]
}

async function getCertificateStats() {
  const supabase = await createClient()

  // Get total counts
  const { count: totalCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })

  const { count: activeCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: revokedCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'revoked')

  const { count: expiredCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'expired')

  return {
    total: totalCount || 0,
    active: activeCount || 0,
    revoked: revokedCount || 0,
    expired: expiredCount || 0,
  }
}

export default async function AdminCertificatesPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/certificates')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const certificates = await getCertificates()
  const stats = await getCertificateStats()

  return (
    <div className="container mx-auto px-4 pt-20 pb-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage certificates and digital badges
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revoked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.revoked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Filter and search certificates (coming soon)
          </p>
        </CardHeader>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Certificates</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Latest 100 certificates issued
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No certificates found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Certificate #</th>
                      <th className="text-left py-3 px-4 font-medium">Recipient</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Course</th>
                      <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">CE Credits</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <code className="text-sm font-mono">{cert.certificate_number}</code>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{cert.recipient_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {cert.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {cert.certificate_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {cert.course?.title || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              cert.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : cert.status === 'revoked'
                                ? 'bg-red-100 text-red-800'
                                : cert.status === 'expired'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {cert.ce_credits ? `${cert.ce_credits} credits` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/certificates/${cert.id}`}>
                              <Button variant="ghost" className="px-2 py-1.5 h-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {cert.pdf_url && (
                              <Button
                                variant="ghost"
                                className="px-2 py-1.5 h-8"
                                onClick={() => window.open(cert.pdf_url!, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
