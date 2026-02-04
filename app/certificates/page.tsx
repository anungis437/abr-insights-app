'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Certificates Page
 * Display user's earned certificates with download and verification options
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, Download, ExternalLink, Calendar, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  expires_at: string | null
  course: {
    title: string
    description: string | null
  } | null
}

export default function CertificatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadCertificates = async () => {
      const supabase = createClient()
      
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/certificates')
        return
      }

      setUserId(user.id)

      try {
        // Fetch user's certificates
        const { data, error } = await supabase
          .from('certificates')
          .select(`
            id,
            user_id,
            course_id,
            certificate_number,
            issued_at,
            expires_at,
            course:courses(title, description)
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })

        if (error) {
          logger.error('Error fetching certificates:', { error, context: 'CertificatesPage' })
        } else {
          setCertificates(data || [])
        }
      } catch (error) {
        logger.error('Error loading certificates:', { error, context: 'CertificatesPage' })
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
            <p className="mt-2 text-gray-600">
              View and download your earned course completion certificates
            </p>
          </div>

          {/* Certificates List */}
          {certificates.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No Certificates Yet</h3>
              <p className="mb-6 text-gray-600">
                Complete courses to earn certificates and showcase your achievements
              </p>
              <Link
                href="/training"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {certificates.map((cert) => {
                const expired = isExpired(cert.expires_at)
                return (
                  <div
                    key={cert.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div
                        className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg ${
                          expired
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                        }`}
                      >
                        <Award className="h-8 w-8" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {cert.course?.title || 'Course Certificate'}
                            </h3>
                            {cert.course?.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {cert.course.description}
                              </p>
                            )}
                          </div>
                          {!expired && (
                            <span className="ml-4 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              Valid
                            </span>
                          )}
                          {expired && (
                            <span className="ml-4 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Issued: {formatDate(cert.issued_at)}
                          </span>
                          {cert.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Expires: {formatDate(cert.expires_at)}
                            </span>
                          )}
                          <span className="font-mono text-xs">#{cert.certificate_number}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/certificates/${cert.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-200"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Certificate
                          </Link>
                          <a
                            href={`/api/certificates/${cert.id}/download`}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </a>
                          <Link
                            href={`/certificates/verify/${cert.certificate_number}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            Verify Certificate
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info Section */}
          {certificates.length > 0 && (
            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-900">About Your Certificates</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Certificates are issued upon successful course completion</li>
                <li>• Each certificate has a unique verification number</li>
                <li>• Download certificates as PDF for your records or sharing</li>
                <li>
                  • Use the verify link to allow others to confirm certificate authenticity
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
