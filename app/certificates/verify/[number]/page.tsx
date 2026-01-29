/**
 * Certificate Verification Page
 *
 * Public page for verifying certificate authenticity
 */

import React from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  Calendar,
  Award,
  ExternalLink,
  Download,
} from 'lucide-react'
import { verifyCertificate } from '@/lib/services/certificates'
import Link from 'next/link'

// ============================================================================
// PAGE
// ============================================================================

export default async function CertificateVerifyPage({ params }: { params: { number: string } }) {
  const certificateNumber = decodeURIComponent(params.number)

  // Verify certificate
  const result = await verifyCertificate(certificateNumber)

  if (!result.certificate) {
    notFound()
  }

  const { valid, certificate, reason, warnings } = result

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-100 p-4 dark:bg-purple-900/20">
          <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Certificate Verification</h1>
        <p className="text-muted-foreground">
          Verify the authenticity of ABR Insights certificates
        </p>
      </div>

      {/* Verification Result */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            {valid ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-600 dark:text-green-400">
                  Valid Certificate
                </CardTitle>
              </>
            ) : (
              <>
                <AlertCircle className="text-destructive h-6 w-6" />
                <CardTitle className="text-destructive">Invalid Certificate</CardTitle>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {valid ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                This certificate has been verified as authentic and was issued by ABR Insights.
              </p>

              {warnings && warnings.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <div className="mb-1 font-semibold text-yellow-900 dark:text-yellow-100">
                        Warnings
                      </div>
                      <ul className="list-inside list-disc text-sm text-yellow-800 dark:text-yellow-200">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {reason || 'This certificate could not be verified.'}
              </p>

              {certificate.status === 'revoked' && certificate.revocation_reason && (
                <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
                  <div className="text-destructive mb-1 font-semibold">Revocation Reason</div>
                  <div className="text-muted-foreground text-sm">
                    {certificate.revocation_reason}
                  </div>
                  {certificate.revoked_at && (
                    <div className="text-muted-foreground mt-2 text-xs">
                      Revoked on {formatDate(certificate.revoked_at)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title & Recipient */}
          <div>
            <div className="text-muted-foreground mb-1 text-sm">Certificate Title</div>
            <div className="mb-4 text-xl font-semibold">{certificate.title}</div>

            <div className="text-muted-foreground mb-1 text-sm">Awarded to</div>
            <div className="text-lg font-medium">{certificate.recipient_name}</div>
          </div>

          {/* Status & Type */}
          <div className="flex items-center gap-2">
            <Badge variant={valid ? 'default' : 'destructive'}>{certificate.status}</Badge>
            <Badge variant="outline">{certificate.certificate_type.replace('_', ' ')}</Badge>
          </div>

          {/* Course */}
          {certificate.course && (
            <div>
              <div className="text-muted-foreground mb-1 text-sm">Course</div>
              <div className="font-medium">{certificate.course.title}</div>
            </div>
          )}

          {/* Description */}
          {certificate.description && (
            <div>
              <div className="text-muted-foreground mb-1 text-sm">Description</div>
              <div className="text-sm">{certificate.description}</div>
            </div>
          )}

          {/* CE Credits */}
          {(certificate.ce_credits || certificate.ce_hours) && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="mb-3 text-sm font-semibold">Continuing Education Credits</div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {certificate.ce_credits && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {certificate.ce_credits}
                    </div>
                    <div className="text-muted-foreground text-xs">Credits</div>
                  </div>
                )}

                {certificate.ce_hours && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {certificate.ce_hours}
                    </div>
                    <div className="text-muted-foreground text-xs">Hours</div>
                  </div>
                )}

                {certificate.regulatory_body && (
                  <div>
                    <div className="text-sm font-semibold">{certificate.regulatory_body}</div>
                    <div className="text-muted-foreground text-xs">Regulatory Body</div>
                  </div>
                )}

                {certificate.credit_category && (
                  <div>
                    <div className="text-sm font-semibold">{certificate.credit_category}</div>
                    <div className="text-muted-foreground text-xs">Category</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <div className="text-muted-foreground text-sm">Issue Date</div>
                <div className="font-medium">{formatDate(certificate.issue_date)}</div>
              </div>
            </div>

            {certificate.expiry_date && (
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div>
                  <div className="text-muted-foreground text-sm">Expiry Date</div>
                  <div className="font-medium">{formatDate(certificate.expiry_date)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Number */}
          <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
            <Shield className="text-muted-foreground h-5 w-5" />
            <div className="flex-1">
              <div className="text-muted-foreground text-sm">Certificate Number</div>
              <div className="font-mono text-sm font-medium">{certificate.certificate_number}</div>
            </div>
          </div>

          {/* Score */}
          {certificate.metadata?.score && (
            <div className="flex items-center gap-3">
              <Award className="text-muted-foreground h-5 w-5" />
              <div>
                <div className="text-muted-foreground text-sm">Achievement Score</div>
                <div className="text-lg font-semibold">{certificate.metadata.score}%</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {valid && (
            <div className="flex flex-wrap gap-3 border-t pt-4">
              {certificate.pdf_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(certificate.pdf_url, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              )}

              <Link href="/courses">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>
          This verification page confirms the authenticity of certificates issued by ABR Insights.
          For questions or concerns, please contact us.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: { params: { number: string } }) {
  const certificateNumber = decodeURIComponent(params.number)

  return {
    title: `Verify Certificate ${certificateNumber} | ABR Insights`,
    description: 'Verify the authenticity of an ABR Insights certificate',
  }
}
