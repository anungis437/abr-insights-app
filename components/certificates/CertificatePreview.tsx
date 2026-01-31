'use client'

import { logger } from '@/lib/utils/production-logger'
/**
 * Certificate Preview Component
 *
 * Displays certificate details with download and verification options
 */

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Share2,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Shield,
} from 'lucide-react'
import type { Certificate, DigitalBadge } from '@/lib/services/certificates'
import { downloadCertificatePDF } from './CertificatePDF'

// ============================================================================
// INTERFACES
// ============================================================================

interface CertificatePreviewProps {
  certificate: Certificate & {
    course?: {
      id: string
      title: string
      slug: string
    }
    badge?: DigitalBadge
  }
  showDownload?: boolean
  showShare?: boolean
  showVerification?: boolean
  onDownload?: () => void
  onShare?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CertificatePreview({
  certificate,
  showDownload = true,
  showShare = true,
  showVerification = true,
  onDownload,
  onShare,
}: CertificatePreviewProps) {
  const [downloading, setDownloading] = useState(false)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'revoked':
        return 'destructive'
      case 'expired':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'default'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />
      case 'revoked':
        return <AlertCircle className="h-4 w-4" />
      case 'expired':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'completion':
        return 'Completion'
      case 'certification':
        return 'Certification'
      case 'ce_credit':
        return 'CE Credit'
      case 'achievement':
        return 'Achievement'
      case 'participation':
        return 'Participation'
      default:
        return type
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    try {
      setDownloading(true)
      await downloadCertificatePDF(certificate, {
        courseTitle: certificate.course?.title,
        organizationName: 'ABR Insights',
      })
    } catch (error) {
      logger.error('Failed to download certificate:', { error: error, context: 'CertificatePreview' })
      alert('Failed to download certificate. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }

    if (navigator.share && certificate.verification_url) {
      try {
        await navigator.share({
          title: certificate.title,
          text: `Check out my certificate: ${certificate.title}`,
          url: certificate.verification_url,
        })
      } catch (error) {
        // User cancelled or error occurred
        logger.debug('Share cancelled or failed', { error })
      }
    } else {
      // Fallback: Copy to clipboard
      if (certificate.verification_url) {
        await navigator.clipboard.writeText(certificate.verification_url)
        alert('Verification link copied to clipboard!')
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="mb-2 text-xl">{certificate.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusColor(certificate.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(certificate.status)}
                    {certificate.status}
                  </span>
                </Badge>
                <Badge variant="outline">{getTypeLabel(certificate.certificate_type)}</Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showDownload && (
              <Button
                variant="outline"
                className="h-8 px-3 py-1.5 text-sm"
                onClick={handleDownload}
                disabled={downloading || certificate.status !== 'active'}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Generating...' : 'Download'}
              </Button>
            )}

            {showShare && (
              <Button
                variant="outline"
                className="h-8 px-3 py-1.5 text-sm"
                onClick={handleShare}
                disabled={!certificate.verification_url}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recipient */}
        <div>
          <div className="text-muted-foreground mb-1 text-sm">Awarded to</div>
          <div className="text-lg font-semibold">{certificate.recipient_name}</div>
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

        {/* Dates & Details */}
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
              <Clock className="text-muted-foreground mt-0.5 h-5 w-5" />
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

        {/* QR Code & Verification */}
        {showVerification && certificate.qr_code_data && certificate.verification_url && (
          <div className="border-t pt-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <Image
                  src={certificate.qr_code_data}
                  alt="Certificate QR Code"
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded border"
                />
              </div>

              {/* Verification Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-2 text-sm font-semibold">Verify This Certificate</div>
                <div className="text-muted-foreground mb-3 text-sm">
                  Scan the QR code or visit the verification link to confirm the authenticity of
                  this certificate.
                </div>
                <Button
                  variant="outline"
                  className="h-8 px-3 py-1.5 text-sm"
                  onClick={() => window.open(certificate.verification_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Verify Online
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Digital Badge */}
        {certificate.badge && (
          <div className="border-t pt-6">
            <div className="mb-3 flex items-center gap-3">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-sm font-semibold">Digital Badge Available</div>
            </div>
            <div className="text-muted-foreground mb-3 text-sm">
              This certificate includes a digital badge that complies with the Open Badges 2.0
              standard. You can add it to your professional profile on LinkedIn, Mozilla Backpack,
              or other badge platforms.
            </div>
            <Button
              variant="outline"
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => {
                if (certificate.badge?.assertion_url) {
                  window.open(certificate.badge.assertion_url, '_blank')
                }
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Badge
            </Button>
          </div>
        )}

        {/* Revocation Info */}
        {certificate.status === 'revoked' && certificate.revocation_reason && (
          <div className="border-t pt-6">
            <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-destructive mt-0.5 h-5 w-5" />
                <div>
                  <div className="text-destructive mb-1 font-semibold">Certificate Revoked</div>
                  <div className="text-muted-foreground text-sm">
                    {certificate.revocation_reason}
                  </div>
                  {certificate.revoked_at && (
                    <div className="text-muted-foreground mt-2 text-xs">
                      Revoked on {formatDate(certificate.revoked_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {certificate.metadata?.score && (
          <div className="text-muted-foreground text-sm">
            Achievement Score:{' '}
            <span className="text-foreground font-semibold">{certificate.metadata.score}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
