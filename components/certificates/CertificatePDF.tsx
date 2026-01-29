/**
 * Certificate PDF Template
 *
 * Generates professional PDF certificates using @react-pdf/renderer
 * Supports multiple certificate types with customizable templates
 */

import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import type { Certificate, CertificateTemplate } from '@/lib/services/certificates'

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Times-Roman',
  },
  pageWithBorder: {
    padding: 50,
    backgroundColor: '#ffffff',
    border: '2px solid #805ad5',
    fontFamily: 'Times-Roman',
  },

  // Header
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  organizationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 5,
  },

  // Title Section
  titleSection: {
    marginBottom: 30,
    alignItems: 'center',
    borderBottom: '2px solid #805ad5',
    paddingBottom: 20,
  },
  certificateLabel: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  certificateTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#805ad5',
    marginBottom: 10,
  },
  certificateNumber: {
    fontSize: 10,
    color: '#718096',
    marginTop: 10,
  },

  // Body Section
  bodySection: {
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  presentedTo: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 10,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '1px solid #cbd5e0',
    paddingBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginVertical: 10,
  },

  // Details Section
  detailsSection: {
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  detailLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 10,
    color: '#2d3748',
  },

  // CE Credits Section
  ceSection: {
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    border: '1px solid #e2e8f0',
  },
  ceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  ceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ceItem: {
    alignItems: 'center',
  },
  ceLabel: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 3,
  },
  ceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#805ad5',
  },

  // Signatures Section
  signaturesSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  signature: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    borderTop: '1px solid #2d3748',
    width: '100%',
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 9,
    color: '#718096',
  },
  signatureImage: {
    width: 100,
    height: 40,
    marginBottom: 5,
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  verificationText: {
    fontSize: 8,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 3,
  },
  verificationUrl: {
    fontSize: 8,
    color: '#805ad5',
    textAlign: 'center',
  },

  // Achievement Badge
  badgeSection: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 80,
    height: 80,
  },
  badgeImage: {
    width: 80,
    height: 80,
  },
})

// ============================================================================
// INTERFACES
// ============================================================================

interface CertificatePDFProps {
  certificate: Certificate
  template?: CertificateTemplate
  courseTitle?: string
  organizationName?: string
  organizationLogo?: string
  badgeImage?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CertificatePDF({
  certificate,
  template,
  courseTitle,
  organizationName = 'ABR Insights',
  organizationLogo,
  badgeImage,
}: CertificatePDFProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get certificate type label
  const getCertificateTypeLabel = () => {
    switch (certificate.certificate_type) {
      case 'completion':
        return 'Certificate of Completion'
      case 'certification':
        return 'Professional Certification'
      case 'ce_credit':
        return 'Continuing Education Certificate'
      case 'achievement':
        return 'Certificate of Achievement'
      case 'participation':
        return 'Certificate of Participation'
      default:
        return 'Certificate'
    }
  }

  // Determine if we should show border
  const showBorder = template?.styles_json?.border !== false

  return (
    <Document>
      <Page
        size="LETTER"
        orientation="landscape"
        style={showBorder ? styles.pageWithBorder : styles.page}
      >
        {/* Badge/Seal (if certification type) */}
        {certificate.certificate_type === 'certification' && badgeImage && (
          <View style={styles.badgeSection}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={badgeImage} style={styles.badgeImage} />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          {organizationLogo && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={organizationLogo} style={styles.logo} />
          )}
          <Text style={styles.organizationName}>{organizationName}</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.certificateLabel}>
            {certificate.certificate_type.replace('_', ' ')}
          </Text>
          <Text style={styles.certificateTitle}>
            {certificate.title || getCertificateTypeLabel()}
          </Text>
          <Text style={styles.certificateNumber}>
            Certificate No: {certificate.certificate_number}
          </Text>
        </View>

        {/* Body Section */}
        <View style={styles.bodySection}>
          <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
          <Text style={styles.recipientName}>{certificate.recipient_name}</Text>

          {certificate.description && (
            <Text style={styles.description}>{certificate.description}</Text>
          )}

          {courseTitle && <Text style={styles.courseTitle}>&quot;{courseTitle}&quot;</Text>}
        </View>

        {/* CE Credits Section (if applicable) */}
        {(certificate.ce_credits || certificate.ce_hours) && (
          <View style={styles.bodySection}>
            <View style={styles.ceSection}>
              <Text style={styles.ceTitle}>Continuing Education Credits</Text>
              <View style={styles.ceDetails}>
                {certificate.ce_credits && (
                  <View style={styles.ceItem}>
                    <Text style={styles.ceLabel}>Credits</Text>
                    <Text style={styles.ceValue}>{certificate.ce_credits}</Text>
                  </View>
                )}
                {certificate.ce_hours && (
                  <View style={styles.ceItem}>
                    <Text style={styles.ceLabel}>Hours</Text>
                    <Text style={styles.ceValue}>{certificate.ce_hours}</Text>
                  </View>
                )}
                {certificate.regulatory_body && (
                  <View style={styles.ceItem}>
                    <Text style={styles.ceLabel}>Regulatory Body</Text>
                    <Text style={styles.ceValue}>{certificate.regulatory_body}</Text>
                  </View>
                )}
                {certificate.credit_category && (
                  <View style={styles.ceItem}>
                    <Text style={styles.ceLabel}>Category</Text>
                    <Text style={styles.ceValue}>{certificate.credit_category}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Issue Date:</Text>
            <Text style={styles.detailValue}>{formatDate(certificate.issue_date)}</Text>
          </View>

          {certificate.expiry_date && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Expiry Date:</Text>
              <Text style={styles.detailValue}>{formatDate(certificate.expiry_date)}</Text>
            </View>
          )}

          {certificate.metadata?.score && (
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Score:</Text>
              <Text style={styles.detailValue}>{certificate.metadata.score}%</Text>
            </View>
          )}
        </View>

        {/* Signatures Section */}
        {certificate.signatures && certificate.signatures.length > 0 && (
          <View style={styles.signaturesSection}>
            {certificate.signatures.map((signature: any, index: number) => (
              <View key={index} style={styles.signature}>
                {signature.image_url && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={signature.image_url} style={styles.signatureImage} />
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.signatureName}>{signature.name}</Text>
                <Text style={styles.signatureTitle}>{signature.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer with QR Code */}
        <View style={styles.footerSection}>
          {certificate.qr_code_data && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={certificate.qr_code_data} style={styles.qrCode} />
          )}
          <Text style={styles.verificationText}>Scan to verify this certificate or visit:</Text>
          {certificate.verification_url && (
            <Text style={styles.verificationUrl}>{certificate.verification_url}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate PDF blob from certificate
 */
export async function generateCertificatePDF(
  certificate: Certificate,
  options?: {
    template?: CertificateTemplate
    courseTitle?: string
    organizationName?: string
    organizationLogo?: string
    badgeImage?: string
  }
): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer')

  const pdfDocument = (
    <CertificatePDF
      certificate={certificate}
      template={options?.template}
      courseTitle={options?.courseTitle}
      organizationName={options?.organizationName}
      organizationLogo={options?.organizationLogo}
      badgeImage={options?.badgeImage}
    />
  )

  return await pdf(pdfDocument).toBlob()
}

/**
 * Download certificate PDF
 */
export async function downloadCertificatePDF(
  certificate: Certificate,
  options?: {
    template?: CertificateTemplate
    courseTitle?: string
    organizationName?: string
    organizationLogo?: string
    badgeImage?: string
  }
): Promise<void> {
  const blob = await generateCertificatePDF(certificate, options)

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `certificate-${certificate.certificate_number}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
