'use client'

import React, { useState, useEffect } from 'react'
import { Download, Trash2, HardDrive, WifiOff, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import {
  useCourseDownload,
  useCacheManagement,
  useOnlineStatus,
  type DownloadedCourse,
} from '@/lib/hooks/usePWA'
import Link from 'next/link'

export default function OfflineCoursesPage() {
  const { downloadedCourses, downloading, removeCourse, refresh } = useCourseDownload()
  const { cacheStatus, checkCacheSize, clearAllCaches } = useCacheManagement()
  const isOnline = useOnlineStatus()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null)

  useEffect(() => {
    refresh()
    checkCacheSize()
  }, [refresh, checkCacheSize])

  const handleRemoveCourse = async (courseId: string, courseName: string) => {
    if (confirm(`Remove "${courseName}" from offline storage?`)) {
      setRemovingCourseId(courseId)
      try {
        await removeCourse(courseId)
        await checkCacheSize()
      } catch (error) {
        console.error('Failed to remove course:', error)
        alert('Failed to remove course. Please try again.')
      } finally {
        setRemovingCourseId(null)
      }
    }
  }

  const handleClearAll = async () => {
    if (showClearConfirm) {
      try {
        await clearAllCaches()
        await refresh()
        setShowClearConfirm(false)
        alert('All offline content cleared successfully!')
      } catch (error) {
        console.error('Failed to clear caches:', error)
        alert('Failed to clear caches. Please try again.')
      }
    } else {
      setShowClearConfirm(true)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const storageUsagePercent =
    cacheStatus.quota > 0 ? (cacheStatus.usage / cacheStatus.quota) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <WifiOff className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offline Courses</h1>
              <p className="mt-1 text-gray-600">Courses downloaded for offline learning</p>
            </div>
          </div>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}
            />
            <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Storage Stats Card */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Storage Usage</h2>
            </div>
            <button
              onClick={handleClearAll}
              className={`rounded-lg px-4 py-2 font-medium transition-all ${
                showClearConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showClearConfirm ? 'Confirm Clear All' : 'Clear All Caches'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Storage Bar */}
            <div>
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>{formatBytes(cacheStatus.usage)} used</span>
                <span>{formatBytes(cacheStatus.quota)} total</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    storageUsagePercent > 90
                      ? 'bg-red-500'
                      : storageUsagePercent > 70
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(storageUsagePercent, 100)}%` } as React.CSSProperties}
                />
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {storageUsagePercent.toFixed(1)}% used
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-bold text-gray-900">{downloadedCourses.length}</div>
                <div className="text-sm text-gray-600">Courses Downloaded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(downloading).length}
                </div>
                <div className="text-sm text-gray-600">Currently Downloading</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatBytes(cacheStatus.usage)}
                </div>
                <div className="text-sm text-gray-600">Total Storage Used</div>
              </div>
            </div>
          </div>
        </div>

        {/* Downloaded Courses List */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Downloaded Courses</h2>
          </div>

          {downloadedCourses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <WifiOff className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No offline courses yet</h3>
              <p className="mb-6 text-gray-600">
                Download courses to access them without an internet connection
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Download size={20} />
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {downloadedCourses.map((course) => {
                const isRemoving = removingCourseId === course.courseId
                const isDownloadingCourse = downloading.includes(course.courseId)

                return (
                  <div
                    key={course.courseId}
                    className="px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="rounded-lg bg-green-100 p-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="mb-1 truncate text-lg font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatDate(course.downloadedAt)}</span>
                            </div>
                            {course.size && (
                              <div className="flex items-center gap-1">
                                <HardDrive size={14} />
                                <span>{formatBytes(course.size)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/training/${course.courseId}`}
                          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          Open Course
                        </Link>
                        <button
                          onClick={() => handleRemoveCourse(course.courseId, course.title)}
                          disabled={isRemoving || isDownloadingCourse}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${course.title} from offline storage`}
                        >
                          {isRemoving ? (
                            <div className="animate-spin">⏳</div>
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Download Progress */}
                    {isDownloadingCourse && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                          <span>Downloading...</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full w-full animate-pulse bg-blue-500 transition-all duration-300" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-4">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-semibold text-blue-900">About Offline Learning</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Downloaded courses are stored on your device for offline access</li>
                <li>• Your progress syncs automatically when you reconnect</li>
                <li>• Quiz attempts taken offline will be submitted when back online</li>
                <li>• Downloaded content may use significant storage space</li>
                <li>• Courses update automatically when new content is available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
