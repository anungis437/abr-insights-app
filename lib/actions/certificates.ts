'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createCertificateFromQuiz,
  updateCertificatePDF,
  Certificate,
} from '@/lib/services/certificates'
import { uploadCertificatePDF } from '@/lib/utils/pdf-storage'
import { redirect } from 'next/navigation'

/**
 * Generate certificate from quiz completion
 * This is called after a user successfully completes a quiz
 */
export async function generateCertificateAction(
  quizAttemptId: string,
  recipientName: string
): Promise<{
  success: boolean
  certificate?: Certificate
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Get quiz attempt with relations
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select(
        `
        *,
        quiz:quizzes(
          *,
          lesson:lessons(
            *,
            module:course_modules(
              *,
              course:courses(*)
            )
          )
        )
      `
      )
      .eq('id', quizAttemptId)
      .eq('user_id', user.id)
      .single()

    if (attemptError || !attempt) {
      return {
        success: false,
        error: 'Quiz attempt not found',
      }
    }

    // Check if quiz was passed
    if (!attempt.passed) {
      return {
        success: false,
        error: 'Quiz must be passed to receive a certificate',
      }
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id, certificate_number')
      .eq('quiz_attempt_id', quizAttemptId)
      .single()

    if (existingCert) {
      return {
        success: false,
        error: `Certificate already exists: ${existingCert.certificate_number}`,
      }
    }

    // Create certificate
    const certificate = await createCertificateFromQuiz(user.id, quizAttemptId, recipientName)

    if (!certificate) {
      return {
        success: false,
        error: 'Failed to create certificate',
      }
    }

    // Upload PDF to storage
    const courseTitle = (attempt as any).quiz?.lesson?.module?.course?.title || 'Course'
    const uploadResult = await uploadCertificatePDF(certificate, {
      courseTitle,
      organizationName: 'ABR Insights',
    })

    if (uploadResult.error) {
      console.error('Failed to upload certificate PDF:', uploadResult.error)
      // Don't fail the entire operation if PDF upload fails
      // Certificate is still valid, user can download it later
    } else {
      // Update certificate with PDF URLs
      await updateCertificatePDF(certificate.id, uploadResult.pdf_url, uploadResult.pdf_file_path)
    }

    return {
      success: true,
      certificate: {
        ...certificate,
        pdf_url: uploadResult.pdf_url,
        pdf_file_path: uploadResult.pdf_file_path,
      },
    }
  } catch (error) {
    console.error('Error generating certificate:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Regenerate certificate PDF
 * Useful if PDF generation failed initially or needs to be updated
 */
export async function regenerateCertificatePDFAction(certificateId: string): Promise<{
  success: boolean
  pdf_url?: string
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Get certificate with relations
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select(
        `
        *,
        course:courses(id, title, slug)
      `
      )
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single()

    if (certError || !certificate) {
      return {
        success: false,
        error: 'Certificate not found',
      }
    }

    // Upload PDF to storage
    const courseTitle = (certificate as any).course?.title || 'Course'
    const uploadResult = await uploadCertificatePDF(certificate as Certificate, {
      courseTitle,
      organizationName: 'ABR Insights',
    })

    if (uploadResult.error) {
      return {
        success: false,
        error: uploadResult.error,
      }
    }

    // Update certificate with PDF URLs
    await updateCertificatePDF(certificate.id, uploadResult.pdf_url, uploadResult.pdf_file_path)

    return {
      success: true,
      pdf_url: uploadResult.pdf_url,
    }
  } catch (error) {
    console.error('Error regenerating certificate PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
