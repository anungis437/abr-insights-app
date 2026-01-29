/**
 * Certificate Detail Page
 *
 * View individual certificate with download and share options
 */

import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCertificate } from '@/lib/services/certificates'
import CertificatePreview from '@/components/certificates/CertificatePreview'

// ============================================================================
// PAGE
// ============================================================================

export default async function CertificateDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/certificates/' + params.id)
  }

  // Get certificate
  const certificate = await getCertificate(params.id, true)

  if (!certificate) {
    notFound()
  }

  // Check access - user must own the certificate
  if (certificate.user_id !== user.id) {
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      notFound()
    }
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Breadcrumb */}
      <div className="text-muted-foreground mb-6 text-sm">
        <a href="/profile" className="hover:text-foreground">
          Profile
        </a>
        {' / '}
        <a href="/profile/certificates" className="hover:text-foreground">
          Certificates
        </a>
        {' / '}
        <span className="text-foreground">{certificate.certificate_number}</span>
      </div>

      {/* Certificate Preview */}
      <CertificatePreview
        certificate={certificate}
        showDownload={true}
        showShare={true}
        showVerification={true}
      />
    </div>
  )
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: { params: { id: string } }) {
  const certificate = await getCertificate(params.id, false)

  if (!certificate) {
    return {
      title: 'Certificate Not Found',
    }
  }

  return {
    title: `${certificate.title} | ABR Insights`,
    description: certificate.description || `Certificate awarded to ${certificate.recipient_name}`,
  }
}
