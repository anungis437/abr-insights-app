import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle,
  Award,
  Calendar,
  User,
  BookOpen,
  Shield,
  Clock
} from 'lucide-react'
import { RevokeCertificateForm } from '@/components/admin/RevokeCertificateForm'

export const metadata: Metadata = {
  title: 'Certificate Details | Admin | ABR Insights',
}

async function getCertificate(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      user:users(id, email, full_name),
      course:courses(id, title, slug),
      quiz_attempt:quiz_attempts(id, score, passed, completed_at),
      template:certificate_templates(name),
      badge:digital_badges(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as any
}

export default async function AdminCertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const certificate = await getCertificate(id)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/admin/certificates">
          <Button variant="ghost" className="px-3 py-1.5 h-8 text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{certificate.title}</h1>
            <p className="text-muted-foreground">
              Certificate #{certificate.certificate_number}
            </p>
          </div>
          <Badge
            variant={
              certificate.status === 'active'
                ? 'default'
                : certificate.status === 'revoked'
                ? 'destructive'
                : 'secondary'
            }
          >
            {certificate.status}
          </Badge>
        </div>
      </div>

      {/* Revocation Warning */}
      {certificate.status === 'revoked' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Certificate Revoked</h3>
                <p className="text-sm text-red-800 mb-2">
                  {certificate.revocation_reason || 'No reason provided'}
                </p>
                <p className="text-xs text-red-700">
                  Revoked on {new Date(certificate.revoked_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Information */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Type
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className="capitalize">{certificate.certificate_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Issue Date
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(certificate.issue_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {certificate.expiry_date && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Expiry Date
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(certificate.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Certificate Number
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <code className="text-sm font-mono">{certificate.certificate_number}</code>
                  </div>
                </div>
              </div>

              {certificate.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </div>
                  <p className="text-sm">{certificate.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Name
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{certificate.recipient_name}</span>
                </div>
              </div>
              {certificate.user && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </div>
                  <span className="text-sm">{certificate.user.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          {certificate.course && (
            <Card>
              <CardHeader>
                <CardTitle>Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <Link
                    href={`/courses/${certificate.course.slug}`}
                    className="text-purple-600 hover:underline"
                  >
                    {certificate.course.title}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CE Credits */}
          {certificate.ce_credits && (
            <Card>
              <CardHeader>
                <CardTitle>Continuing Education Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Credits
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {certificate.ce_credits}
                    </div>
                  </div>
                  {certificate.ce_hours && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Hours
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {certificate.ce_hours}
                      </div>
                    </div>
                  )}
                  {certificate.regulatory_body && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Regulatory Body
                      </div>
                      <span className="text-sm">{certificate.regulatory_body}</span>
                    </div>
                  )}
                  {certificate.credit_category && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Category
                      </div>
                      <span className="text-sm">{certificate.credit_category}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Performance */}
          {certificate.quiz_attempt && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Score
                    </div>
                    <div className="text-2xl font-bold">
                      {certificate.quiz_attempt.score?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </div>
                    <Badge variant={certificate.quiz_attempt.passed ? 'default' : 'destructive'}>
                      {certificate.quiz_attempt.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/certificates/${certificate.id}`} className="block">
                <Button variant="outline" className="w-full">
                  View Public Certificate
                </Button>
              </Link>
              {certificate.pdf_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(certificate.pdf_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              {certificate.verification_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(certificate.verification_url, '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Certificate
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Revoke Certificate */}
          {certificate.status === 'active' && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Revoke Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <RevokeCertificateForm certificateId={certificate.id} />
              </CardContent>
            </Card>
          )}

          {/* Digital Badge */}
          {certificate.badge && (
            <Card>
              <CardHeader>
                <CardTitle>Digital Badge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-1">
                      Status
                    </div>
                    <Badge>{certificate.badge.status}</Badge>
                  </div>
                  {certificate.badge.assertion_url && (
                    <Button
                      variant="outline"
                      className="w-full px-3 py-1.5 h-8 text-sm"
                      onClick={() => window.open(certificate.badge.assertion_url, '_blank')}
                    >
                      View Badge Assertion
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
