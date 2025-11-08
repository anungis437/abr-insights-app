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
  Download
} from 'lucide-react'
import { verifyCertificate } from '@/lib/services/certificates'
import Link from 'next/link'

// ============================================================================
// PAGE
// ============================================================================

export default async function CertificateVerifyPage({
  params
}: {
  params: { number: string }
}) {
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
      day: 'numeric'
    })
  }
  
  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20 p-4 mb-4">
          <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
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
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">
                  Invalid Certificate
                </CardTitle>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {valid ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This certificate has been verified as authentic and was issued by ABR Insights.
              </p>
              
              {warnings && warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Warnings
                      </div>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside">
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
              <p className="text-sm text-muted-foreground">
                {reason || 'This certificate could not be verified.'}
              </p>
              
              {certificate.status === 'revoked' && certificate.revocation_reason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="font-semibold text-destructive mb-1">
                    Revocation Reason
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {certificate.revocation_reason}
                  </div>
                  {certificate.revoked_at && (
                    <div className="text-xs text-muted-foreground mt-2">
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
            <div className="text-sm text-muted-foreground mb-1">Certificate Title</div>
            <div className="text-xl font-semibold mb-4">{certificate.title}</div>
            
            <div className="text-sm text-muted-foreground mb-1">Awarded to</div>
            <div className="text-lg font-medium">{certificate.recipient_name}</div>
          </div>
          
          {/* Status & Type */}
          <div className="flex items-center gap-2">
            <Badge variant={valid ? 'default' : 'destructive'}>
              {certificate.status}
            </Badge>
            <Badge variant="outline">
              {certificate.certificate_type.replace('_', ' ')}
            </Badge>
          </div>
          
          {/* Course */}
          {certificate.course && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Course</div>
              <div className="font-medium">{certificate.course.title}</div>
            </div>
          )}
          
          {/* Description */}
          {certificate.description && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Description</div>
              <div className="text-sm">{certificate.description}</div>
            </div>
          )}
          
          {/* CE Credits */}
          {(certificate.ce_credits || certificate.ce_hours) && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm font-semibold mb-3">Continuing Education Credits</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certificate.ce_credits && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {certificate.ce_credits}
                    </div>
                    <div className="text-xs text-muted-foreground">Credits</div>
                  </div>
                )}
                
                {certificate.ce_hours && (
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {certificate.ce_hours}
                    </div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                )}
                
                {certificate.regulatory_body && (
                  <div>
                    <div className="text-sm font-semibold">{certificate.regulatory_body}</div>
                    <div className="text-xs text-muted-foreground">Regulatory Body</div>
                  </div>
                )}
                
                {certificate.credit_category && (
                  <div>
                    <div className="text-sm font-semibold">{certificate.credit_category}</div>
                    <div className="text-xs text-muted-foreground">Category</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Issue Date</div>
                <div className="font-medium">{formatDate(certificate.issue_date)}</div>
              </div>
            </div>
            
            {certificate.expiry_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Expiry Date</div>
                  <div className="font-medium">{formatDate(certificate.expiry_date)}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Certificate Number */}
          <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Certificate Number</div>
              <div className="font-mono text-sm font-medium">{certificate.certificate_number}</div>
            </div>
          </div>
          
          {/* Score */}
          {certificate.metadata?.score && (
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Achievement Score</div>
                <div className="text-lg font-semibold">{certificate.metadata.score}%</div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          {valid && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {certificate.pdf_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(certificate.pdf_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              )}
              
              <Link href="/courses">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
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

export async function generateMetadata({
  params
}: {
  params: { number: string }
}) {
  const certificateNumber = decodeURIComponent(params.number)
  
  return {
    title: `Verify Certificate ${certificateNumber} | ABR Insights`,
    description: 'Verify the authenticity of an ABR Insights certificate'
  }
}
