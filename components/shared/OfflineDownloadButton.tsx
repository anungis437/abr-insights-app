'use client'

import React from 'react'
import { Download, CheckCircle, Loader2, XCircle, HardDrive } from 'lucide-react'
import { useCourseDownload } from '@/lib/hooks/usePWA'

interface OfflineDownloadButtonProps {
  courseId: string
  courseName: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  showLabel?: boolean
  estimatedSize?: number // in MB
}

export default function OfflineDownloadButton({
  courseId,
  courseName,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  estimatedSize,
}: OfflineDownloadButtonProps) {
  const { downloadedCourses, downloading, downloadCourse, removeCourse, isDownloaded } = useCourseDownload()
  
  const downloaded = isDownloaded(courseId)
  const isDownloading = downloading.includes(courseId)
  const progress = 0 // Progress tracking would need to be implemented in the hook

  const handleClick = async () => {
    if (downloaded) {
      if (confirm(`Remove "${courseName}" from offline storage?`)) {
        await removeCourse(courseId)
      }
    } else {
      try {
        await downloadCourse(courseId)
      } catch (error) {
        console.error('Download failed:', error)
        alert('Failed to download course. Please check your connection and try again.')
      }
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  // Variant classes
  const variantClasses = {
    primary: downloaded
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: downloaded
      ? 'bg-green-100 hover:bg-green-200 text-green-700'
      : 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    outline: downloaded
      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isDownloading}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-medium
          transition-all duration-200
          flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${downloaded ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
        `}
        aria-label={downloaded ? `Remove ${courseName} from offline storage` : `Download ${courseName} for offline use`}
      >
        {isDownloading ? (
          <>
            <Loader2 size={iconSizes[size]} className="animate-spin" />
            {showLabel && <span>Downloading...</span>}
          </>
        ) : downloaded ? (
          <>
            <CheckCircle size={iconSizes[size]} />
            {showLabel && <span>Downloaded</span>}
          </>
        ) : (
          <>
            <Download size={iconSizes[size]} />
            {showLabel && <span>Download</span>}
          </>
        )}
      </button>

      {/* Progress bar */}
      {isDownloading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-label={`Downloading ${courseName}`}
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* Estimated size badge */}
      {estimatedSize && !downloaded && !isDownloading && (
        <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <HardDrive size={12} />
          <span>{estimatedSize}MB</span>
        </div>
      )}
    </div>
  )
}

// Compact variant for lists
export function OfflineDownloadIcon({
  courseId,
  courseName,
}: {
  courseId: string
  courseName: string
}) {
  const { isDownloaded } = useCourseDownload()
  const downloaded = isDownloaded(courseId)

  if (!downloaded) return null

  return (
    <div
      className="inline-flex items-center gap-1 text-green-600 text-sm"
      title={`${courseName} is available offline`}
    >
      <CheckCircle size={16} />
      <span className="hidden sm:inline">Offline</span>
    </div>
  )
}
