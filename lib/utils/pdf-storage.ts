import { createClient } from '@/lib/supabase/server'
import { Certificate } from '@/lib/services/certificates'
import { generateCertificatePDF } from '@/components/certificates/CertificatePDF'
import { logger } from '@/lib/utils/production-logger'

/**
 * Upload certificate PDF to Supabase Storage
 *
 * @param certificate - Certificate data
 * @param organizationName - Organization name for PDF
 * @param courseTitle - Course title for PDF
 * @returns Object with pdf_url and pdf_file_path
 */
export async function uploadCertificatePDF(
  certificate: Certificate,
  options?: {
    organizationName?: string
    courseTitle?: string
  }
): Promise<{
  pdf_url: string
  pdf_file_path: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Generate PDF blob
    const pdfBlob = await generateCertificatePDF(certificate, {
      courseTitle: options?.courseTitle,
      organizationName: options?.organizationName,
    })

    // Create file path
    const timestamp = Date.now()
    const fileName = `certificate-${certificate.certificate_number}-${timestamp}.pdf`
    const filePath = `certificates/${certificate.user_id}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('certificates').upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false,
      cacheControl: '31536000', // Cache for 1 year
    })

    if (error) {
      logger.error('Certificate PDF upload failed', { error, filePath, certificate_id: certificate.id })
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(data.path)

    return {
      pdf_url: urlData.publicUrl,
      pdf_file_path: data.path,
    }
  } catch (error) {
    logger.error('Certificate PDF upload exception', { error, certificate_id: certificate.id })
    return {
      pdf_url: '',
      pdf_file_path: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete certificate PDF from Supabase Storage
 *
 * @param filePath - File path in storage
 * @returns Success boolean
 */
export async function deleteCertificatePDF(filePath: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.storage.from('certificates').remove([filePath])

    if (error) {
      logger.error('Certificate PDF deletion failed', { error, filePath })
      return false
    }

    return true
  } catch (error) {
    logger.error('Certificate PDF deletion exception', { error, filePath })
    return false
  }
}

/**
 * Ensure certificates storage bucket exists
 * Creates the bucket if it doesn't exist
 */
export async function ensureCertificatesBucket(): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      logger.error('Storage bucket listing failed', { error: listError })
      return false
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === 'certificates')

    if (bucketExists) {
      return true
    }

    // Create bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket('certificates', {
      public: true, // Make PDFs publicly accessible
      fileSizeLimit: 10485760, // 10MB limit
      allowedMimeTypes: ['application/pdf'],
    })

    if (createError) {
      logger.error('Certificates bucket creation failed', { error: createError })
      return false
    }

    return true
  } catch (error) {
    logger.error('Failed to ensure certificates bucket', { error })
    return false
  }
}
