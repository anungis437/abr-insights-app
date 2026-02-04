/**
 * PR-06: Data Export Service
 *
 * Generates comprehensive data exports for organization offboarding.
 * Exports all user data, course progress, billing records, and audit logs
 * in GDPR-compliant ZIP/CSV format.
 *
 * @module lib/services/data-export
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'
import * as fs from 'fs/promises'
import * as path from 'path'
import { createWriteStream } from 'fs'
import archiver from 'archiver'
import { createHash } from 'crypto'

// =====================================================
// Types
// =====================================================

export interface ExportOptions {
  organizationId: string
  requestedBy: string
  includeAuditLogs?: boolean
  includeBillingRecords?: boolean
  format?: 'zip' | 'csv' | 'json'
}

export interface ExportResult {
  success: boolean
  filePath?: string
  fileSize?: number
  checksum?: string
  manifest?: ExportManifest
  error?: string
}

export interface ExportManifest {
  organizationId: string
  exportedAt: string
  requestedBy: string
  totalFiles: number
  totalSizeBytes: number
  files: ExportedFile[]
  counts: DataCounts
}

export interface ExportedFile {
  name: string
  type: string
  sizeBytes: number
  recordCount: number
  checksum: string
}

export interface DataCounts {
  users: number
  courses: number
  enrollments: number
  progressRecords: number
  quizAttempts: number
  certificates: number
  achievements: number
  aiUsage: number
  billingRecords: number
  auditLogs: number
}

// =====================================================
// Data Export Service
// =====================================================

class DataExportService {
  /**
   * Generate complete data export for organization
   */
  async generateExport(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now()
    const exportId = `export_${options.organizationId}_${Date.now()}`
    const tempDir = path.join(process.cwd(), 'temp', exportId)

    logger.info('Starting data export', {
      organization_id: options.organizationId,
      requested_by: options.requestedBy,
      export_id: exportId,
    })

    try {
      // Create temp directory
      await fs.mkdir(tempDir, { recursive: true })

      // Initialize manifest
      const manifest: ExportManifest = {
        organizationId: options.organizationId,
        exportedAt: new Date().toISOString(),
        requestedBy: options.requestedBy,
        totalFiles: 0,
        totalSizeBytes: 0,
        files: [],
        counts: {
          users: 0,
          courses: 0,
          enrollments: 0,
          progressRecords: 0,
          quizAttempts: 0,
          certificates: 0,
          achievements: 0,
          aiUsage: 0,
          billingRecords: 0,
          auditLogs: 0,
        },
      }

      // Export all data categories
      await this.exportUsers(options.organizationId, tempDir, manifest)
      await this.exportCourses(options.organizationId, tempDir, manifest)
      await this.exportEnrollments(options.organizationId, tempDir, manifest)
      await this.exportProgress(options.organizationId, tempDir, manifest)
      await this.exportQuizAttempts(options.organizationId, tempDir, manifest)
      await this.exportCertificates(options.organizationId, tempDir, manifest)
      await this.exportAchievements(options.organizationId, tempDir, manifest)
      await this.exportAIUsage(options.organizationId, tempDir, manifest)

      if (options.includeBillingRecords) {
        await this.exportBillingRecords(options.organizationId, tempDir, manifest)
      }

      if (options.includeAuditLogs) {
        await this.exportAuditLogs(options.organizationId, tempDir, manifest)
      }

      // Write manifest
      const manifestPath = path.join(tempDir, 'manifest.json')
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
      const manifestStats = await fs.stat(manifestPath)
      manifest.files.push({
        name: 'manifest.json',
        type: 'metadata',
        sizeBytes: manifestStats.size,
        recordCount: 1,
        checksum: await this.calculateChecksum(manifestPath),
      })
      manifest.totalFiles++
      manifest.totalSizeBytes += manifestStats.size

      // Create ZIP archive
      const zipPath = path.join(process.cwd(), 'temp', `${exportId}.zip`)
      await this.createZipArchive(tempDir, zipPath)

      // Calculate ZIP checksum
      const zipChecksum = await this.calculateChecksum(zipPath)
      const zipStats = await fs.stat(zipPath)

      // Clean up temp directory (keep only ZIP)
      await fs.rm(tempDir, { recursive: true, force: true })

      const duration = Date.now() - startTime

      logger.info('Data export completed', {
        organization_id: options.organizationId,
        export_id: exportId,
        file_size_bytes: zipStats.size,
        total_files: manifest.totalFiles,
        duration_ms: duration,
      })

      return {
        success: true,
        filePath: zipPath,
        fileSize: zipStats.size,
        checksum: zipChecksum,
        manifest,
      }
    } catch (error) {
      logger.error('Data export failed', {
        organization_id: options.organizationId,
        export_id: exportId,
        error: error instanceof Error ? error.message : String(error),
      })

      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      }
    }
  }

  /**
   * Export users data
   */
  private async exportUsers(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: users, error } = await supabase
      .from('user_organizations')
      .select(
        `
        user_id,
        role,
        joined_at,
        profiles:user_id (
          full_name,
          email,
          created_at,
          updated_at
        )
      `
      )
      .eq('organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(users || [], [
      'user_id',
      'role',
      'joined_at',
      'full_name',
      'email',
      'created_at',
      'updated_at',
    ])

    const filePath = path.join(outputDir, 'users.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.users = users?.length || 0
    manifest.files.push({
      name: 'users.csv',
      type: 'users',
      sizeBytes: stats.size,
      recordCount: users?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export courses data
   */
  private async exportCourses(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(courses || [], [
      'id',
      'title',
      'description',
      'status',
      'created_at',
      'updated_at',
    ])

    const filePath = path.join(outputDir, 'courses.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.courses = courses?.length || 0
    manifest.files.push({
      name: 'courses.csv',
      type: 'courses',
      sizeBytes: stats.size,
      recordCount: courses?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export enrollments data
   */
  private async exportEnrollments(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(
        `
        *,
        courses!inner(organization_id)
      `
      )
      .eq('courses.organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(enrollments || [], [
      'id',
      'user_id',
      'course_id',
      'status',
      'enrolled_at',
      'completed_at',
    ])

    const filePath = path.join(outputDir, 'enrollments.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.enrollments = enrollments?.length || 0
    manifest.files.push({
      name: 'enrollments.csv',
      type: 'enrollments',
      sizeBytes: stats.size,
      recordCount: enrollments?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export progress records
   */
  private async exportProgress(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: progress, error } = await supabase
      .from('lesson_progress')
      .select(
        `
        *,
        courses!inner(organization_id)
      `
      )
      .eq('courses.organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(progress || [], [
      'id',
      'user_id',
      'course_id',
      'lesson_id',
      'completed',
      'progress_percentage',
      'time_spent_seconds',
      'last_accessed_at',
    ])

    const filePath = path.join(outputDir, 'progress.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.progressRecords = progress?.length || 0
    manifest.files.push({
      name: 'progress.csv',
      type: 'progress',
      sizeBytes: stats.size,
      recordCount: progress?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export quiz attempts
   */
  private async exportQuizAttempts(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(
        `
        *,
        courses!inner(organization_id)
      `
      )
      .eq('courses.organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(attempts || [], [
      'id',
      'user_id',
      'quiz_id',
      'score',
      'passed',
      'started_at',
      'completed_at',
    ])

    const filePath = path.join(outputDir, 'quiz_attempts.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.quizAttempts = attempts?.length || 0
    manifest.files.push({
      name: 'quiz_attempts.csv',
      type: 'quiz_attempts',
      sizeBytes: stats.size,
      recordCount: attempts?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export certificates
   */
  private async exportCertificates(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(
        `
        *,
        courses!inner(organization_id)
      `
      )
      .eq('courses.organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(certificates || [], [
      'id',
      'user_id',
      'course_id',
      'certificate_url',
      'issued_at',
    ])

    const filePath = path.join(outputDir, 'certificates.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.certificates = certificates?.length || 0
    manifest.files.push({
      name: 'certificates.csv',
      type: 'certificates',
      sizeBytes: stats.size,
      recordCount: certificates?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export achievements
   */
  private async exportAchievements(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select(
        `
        *,
        user_organizations!inner(organization_id)
      `
      )
      .eq('user_organizations.organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(achievements || [], [
      'id',
      'user_id',
      'achievement_type',
      'earned_at',
    ])

    const filePath = path.join(outputDir, 'achievements.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.achievements = achievements?.length || 0
    manifest.files.push({
      name: 'achievements.csv',
      type: 'achievements',
      sizeBytes: stats.size,
      recordCount: achievements?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export AI usage data
   */
  private async exportAIUsage(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: usage, error } = await supabase
      .from('ai_usage_daily')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(usage || [], [
      'id',
      'organization_id',
      'date',
      'gpt4_requests',
      'gpt35_requests',
      'claude_requests',
      'total_cost_cents',
    ])

    const filePath = path.join(outputDir, 'ai_usage.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.aiUsage = usage?.length || 0
    manifest.files.push({
      name: 'ai_usage.csv',
      type: 'ai_usage',
      sizeBytes: stats.size,
      recordCount: usage?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export billing records
   */
  private async exportBillingRecords(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: billing, error } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error

    const csv = this.convertToCSV(billing || [], [
      'id',
      'organization_id',
      'amount_cents',
      'currency',
      'status',
      'stripe_payment_intent_id',
      'created_at',
    ])

    const filePath = path.join(outputDir, 'billing.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.billingRecords = billing?.length || 0
    manifest.files.push({
      name: 'billing.csv',
      type: 'billing',
      sizeBytes: stats.size,
      recordCount: billing?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Export audit logs
   */
  private async exportAuditLogs(
    organizationId: string,
    outputDir: string,
    manifest: ExportManifest
  ): Promise<void> {
    const supabase = await createClient()
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const csv = this.convertToCSV(logs || [], [
      'id',
      'organization_id',
      'user_id',
      'action',
      'resource_type',
      'resource_id',
      'ip_address',
      'created_at',
    ])

    const filePath = path.join(outputDir, 'audit_logs.csv')
    await fs.writeFile(filePath, csv)

    const stats = await fs.stat(filePath)
    manifest.counts.auditLogs = logs?.length || 0
    manifest.files.push({
      name: 'audit_logs.csv',
      type: 'audit_logs',
      sizeBytes: stats.size,
      recordCount: logs?.length || 0,
      checksum: await this.calculateChecksum(filePath),
    })
    manifest.totalFiles++
    manifest.totalSizeBytes += stats.size
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[], columns: string[]): string {
    if (data.length === 0) {
      return columns.join(',') + '\n'
    }

    const header = columns.join(',')
    const rows = data.map((row) => {
      return columns
        .map((col) => {
          const value = this.getNestedValue(row, col)
          // Escape commas and quotes
          if (value === null || value === undefined) return ''
          const str = String(value)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(',')
    })

    return header + '\n' + rows.join('\n')
  }

  /**
   * Get nested value from object (e.g., 'profiles.email')
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.')
    let current = obj
    for (const part of parts) {
      if (current === null || current === undefined) return null
      current = current[part]
    }
    return current
  }

  /**
   * Create ZIP archive from directory
   */
  private async createZipArchive(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => resolve())
      archive.on('error', (err: Error) => reject(err))

      archive.pipe(output)
      archive.directory(sourceDir, false)
      archive.finalize()
    })
  }

  /**
   * Calculate SHA-256 checksum of file
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)
    return createHash('sha256').update(buffer).digest('hex')
  }
}

// =====================================================
// Export singleton instance
// =====================================================

export const dataExport = new DataExportService()
