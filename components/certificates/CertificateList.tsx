/**
 * Certificate List Component
 *
 * Displays a list of user certificates with filtering and sorting
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  Calendar,
  Download,
  FileText,
  Filter,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import {
  getUserCertificates,
  type Certificate,
  type CertificateType,
} from '@/lib/services/certificates'
import Link from 'next/link'

// ============================================================================
// INTERFACES
// ============================================================================

interface CertificateListProps {
  userId: string
  courseId?: string
  certificateType?: CertificateType
  limit?: number
  showFilters?: boolean
}

interface CertificateWithCourse extends Certificate {
  course?: {
    id: string
    title: string
    slug: string
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CertificateList({
  userId,
  courseId,
  certificateType,
  limit,
  showFilters = true,
}: CertificateListProps) {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<CertificateType | undefined>(certificateType)
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  // Load certificates
  const loadCertificates = async () => {
    try {
      setLoading(true)
      const data = await getUserCertificates(userId, {
        course_id: courseId,
        certificate_type: filterType,
        status: filterStatus as any,
      })

      let filtered = data
      if (limit) {
        filtered = filtered.slice(0, limit)
      }

      setCertificates(filtered)
    } catch (error) {
      console.error('Failed to load certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, courseId, filterType, filterStatus])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        return <CheckCircle2 className="h-3 w-3" />
      case 'revoked':
        return <AlertCircle className="h-3 w-3" />
      case 'expired':
        return <Clock className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'ce_credit':
        return <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      default:
        return <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-muted h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="bg-muted h-5 w-2/3 rounded" />
                  <div className="bg-muted h-4 w-1/2 rounded" />
                  <div className="bg-muted h-4 w-1/3 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-muted mb-4 rounded-full p-4">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
          <div className="mb-2 text-lg font-semibold">No Certificates Yet</div>
          <div className="text-muted-foreground max-w-md text-center text-sm">
            Complete courses and pass certification quizzes to earn certificates that showcase your
            expertise.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm">Filter:</span>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterType === undefined ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterType(undefined)}
            >
              All Types
            </Button>
            <Button
              variant={filterType === 'completion' ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterType('completion')}
            >
              Completion
            </Button>
            <Button
              variant={filterType === 'certification' ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterType('certification')}
            >
              Certification
            </Button>
            <Button
              variant={filterType === 'ce_credit' ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterType('ce_credit')}
            >
              CE Credit
            </Button>
          </div>

          {/* Status Filter */}
          <div className="ml-4 flex gap-2">
            <Button
              variant={filterStatus === undefined ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterStatus(undefined)}
            >
              All Status
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'expired' ? 'default' : 'outline'}
              className="h-8 px-3 py-1.5 text-sm"
              onClick={() => setFilterStatus('expired')}
            >
              Expired
            </Button>
          </div>
        </div>
      )}

      {/* Certificate Cards */}
      <div className="space-y-4">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="bg-muted flex-shrink-0 rounded-lg p-3">
                  {getTypeIcon(certificate.certificate_type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-1 truncate text-lg font-semibold">{certificate.title}</h3>

                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusColor(certificate.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(certificate.status)}
                            {certificate.status}
                          </span>
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(certificate.certificate_type)}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/certificates/${certificate.id}`}>
                        <Button variant="outline" className="h-8 px-3 py-1.5 text-sm">
                          View
                        </Button>
                      </Link>

                      {certificate.status === 'active' && certificate.pdf_url && (
                        <Button
                          variant="outline"
                          className="h-8 px-2 py-1.5"
                          onClick={() => window.open(certificate.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Course */}
                  {certificate.course && (
                    <div className="text-muted-foreground mb-2 text-sm">
                      <span className="font-medium">{certificate.course.title}</span>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {/* Issue Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <div>
                        <div className="text-muted-foreground text-xs">Issued</div>
                        <div className="text-sm font-medium">
                          {formatDate(certificate.issue_date)}
                        </div>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    {certificate.expiry_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <div>
                          <div className="text-muted-foreground text-xs">Expires</div>
                          <div className="text-sm font-medium">
                            {formatDate(certificate.expiry_date)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CE Credits */}
                    {certificate.ce_credits && (
                      <div className="flex items-center gap-2">
                        <Award className="text-muted-foreground h-4 w-4" />
                        <div>
                          <div className="text-muted-foreground text-xs">CE Credits</div>
                          <div className="text-sm font-medium">{certificate.ce_credits}</div>
                        </div>
                      </div>
                    )}

                    {/* Score */}
                    {certificate.metadata?.score && (
                      <div className="flex items-center gap-2">
                        <Trophy className="text-muted-foreground h-4 w-4" />
                        <div>
                          <div className="text-muted-foreground text-xs">Score</div>
                          <div className="text-sm font-medium">{certificate.metadata.score}%</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Number */}
                  <div className="mt-3 border-t pt-3">
                    <div className="text-muted-foreground text-xs">
                      Certificate No:{' '}
                      <span className="font-mono">{certificate.certificate_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Link */}
      {limit && certificates.length >= limit && (
        <div className="text-center">
          <Link href="/profile/certificates">
            <Button variant="outline">View All Certificates</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
