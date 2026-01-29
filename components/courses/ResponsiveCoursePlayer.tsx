'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Download,
  StickyNote,
  CheckCircle,
  Circle,
  PlayCircle,
  Clock,
  Award,
} from 'lucide-react'
import { useResponsive } from '@/lib/hooks/useResponsive'
import MobileVideoPlayer from '@/components/shared/MobileVideoPlayer'

export interface CourseModule {
  id: string
  title: string
  duration: number
  videoUrl: string
  transcript?: string
  resources?: Resource[]
  completed: boolean
  currentProgress?: number
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'video' | 'link'
  url: string
  size?: string
}

export interface CoursePlayerProps {
  courseId: string
  courseTitle: string
  modules: CourseModule[]
  currentModuleIndex: number
  onModuleChange: (index: number) => void
  onProgress: (moduleId: string, progress: number) => void
  onComplete: (moduleId: string) => void
  userNotes?: string
  onNotesChange?: (notes: string) => void
}

export default function ResponsiveCoursePlayer({
  courseId,
  courseTitle,
  modules,
  currentModuleIndex,
  onModuleChange,
  onProgress,
  onComplete,
  userNotes = '',
  onNotesChange,
}: CoursePlayerProps) {
  const responsive = useResponsive()
  const [sidebarOpen, setSidebarOpen] = useState(!responsive.isMobile)
  const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'resources' | 'notes'>(
    'video'
  )
  const [showModuleSheet, setShowModuleSheet] = useState(false)
  const [notes, setNotes] = useState(userNotes)
  const [autoPlayNext, setAutoPlayNext] = useState(true)

  const currentModule = modules[currentModuleIndex]
  const hasNext = currentModuleIndex < modules.length - 1
  const hasPrevious = currentModuleIndex > 0

  // Close sidebar on mobile when module changes
  useEffect(() => {
    if (responsive.isMobile) {
      setSidebarOpen(false)
      setShowModuleSheet(false)
    }
  }, [currentModuleIndex, responsive.isMobile])

  // Update sidebar visibility on responsive change
  useEffect(() => {
    setSidebarOpen(!responsive.isMobile)
  }, [responsive.isMobile])

  const handlePreviousModule = () => {
    if (hasPrevious) {
      onModuleChange(currentModuleIndex - 1)
    }
  }

  const handleNextModule = () => {
    if (hasNext) {
      onModuleChange(currentModuleIndex + 1)
    }
  }

  const handleVideoComplete = () => {
    onComplete(currentModule.id)
    if (autoPlayNext && hasNext) {
      setTimeout(() => handleNextModule(), 2000)
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    onNotesChange?.(newNotes)
  }

  const calculateCourseProgress = () => {
    const completed = modules.filter((m) => m.completed).length
    return Math.round((completed / modules.length) * 100)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalDuration = () => {
    return modules.reduce((acc, m) => acc + m.duration, 0)
  }

  // =====================================================
  // Mobile Module Sheet
  // =====================================================

  const MobileModuleSheet = () => (
    <div
      className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${
        showModuleSheet ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={() => setShowModuleSheet(false)}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white transition-transform dark:bg-gray-900 ${
          showModuleSheet ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pb-2 pt-4">
          <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Modules</h3>
            <button
              onClick={() => setShowModuleSheet(false)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close module list"
              title="Close module list"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {modules.filter((m) => m.completed).length} of {modules.length} completed
          </p>
        </div>

        {/* Module List */}
        <div className="space-y-2 p-4">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => {
                onModuleChange(index)
                setShowModuleSheet(false)
              }}
              className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                index === currentModuleIndex
                  ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              {module.completed ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              ) : index === currentModuleIndex ? (
                <PlayCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {index + 1}. {module.title}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {formatDuration(module.duration)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // =====================================================
  // Desktop Sidebar
  // =====================================================

  const DesktopSidebar = () => (
    <aside
      className={`${
        responsive.isMobile ? 'hidden' : 'block'
      } w-80 overflow-y-auto border-r border-gray-200 bg-white transition-all dark:border-gray-700 dark:bg-gray-900 ${
        sidebarOpen ? 'translate-x-0' : 'absolute -translate-x-full'
      }`}
    >
      {/* Course Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <Link
          href={`/courses/${courseId}`}
          className="mb-2 flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <h2 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
          {courseTitle}
        </h2>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Course Progress</span>
            <span>{calculateCourseProgress()}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${calculateCourseProgress()}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="text-xs">
            <p className="text-gray-600 dark:text-gray-400">Total Duration</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(getTotalDuration())}
            </p>
          </div>
          <div className="text-xs">
            <p className="text-gray-600 dark:text-gray-400">Modules</p>
            <p className="font-medium text-gray-900 dark:text-white">{modules.length}</p>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="p-2">
        {modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(index)}
            className={`mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
              index === currentModuleIndex
                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {module.completed ? (
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            ) : index === currentModuleIndex ? (
              <PlayCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {index + 1}. {module.title}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="mr-1 inline h-3 w-3" />
                {formatDuration(module.duration)}
              </p>
              {module.currentProgress && module.currentProgress > 0 && !module.completed && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${module.currentProgress}%` } as React.CSSProperties}
                  />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  )

  // =====================================================
  // Main Content Area
  // =====================================================

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      {!responsive.isMobile && <DesktopSidebar />}

      {/* Mobile Module Sheet */}
      {responsive.isMobile && <MobileModuleSheet />}

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Progress Bar (Sticky) */}
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${calculateCourseProgress()}%` } as React.CSSProperties}
            />
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() =>
                responsive.isMobile ? setShowModuleSheet(true) : setSidebarOpen(!sidebarOpen)
              }
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={
                responsive.isMobile
                  ? 'Open module list'
                  : sidebarOpen
                    ? 'Close sidebar'
                    : 'Open sidebar'
              }
              title={
                responsive.isMobile
                  ? 'Open module list'
                  : sidebarOpen
                    ? 'Close sidebar'
                    : 'Open sidebar'
              }
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 px-3">
              <h1 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {currentModule.title}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Module {currentModuleIndex + 1} of {modules.length}
              </p>
            </div>
            {modules.filter((m) => m.completed).length === modules.length && (
              <Award className="h-6 w-6 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player (Full Width on Mobile) */}
          {activeTab === 'video' && (
            <div className={`${responsive.isMobile ? 'w-full' : 'mx-auto max-w-5xl p-6'}`}>
              <MobileVideoPlayer
                src={currentModule.videoUrl}
                title={currentModule.title}
                onProgress={(progress) => onProgress(currentModule.id, progress)}
                onComplete={handleVideoComplete}
                initialProgress={currentModule.currentProgress || 0}
                enableDownload
                courseId={courseId}
              />

              {/* Auto-play Toggle */}
              <div className="mt-4 flex items-center justify-between px-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoPlayNext}
                    onChange={(e) => setAutoPlayNext(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Auto-play next module</span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex items-center justify-between px-4 pb-4">
                <button
                  onClick={handlePreviousModule}
                  disabled={!hasPrevious}
                  className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={handleNextModule}
                  disabled={!hasNext}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div className="mx-auto max-w-4xl p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Transcript</h2>
              {currentModule.transcript ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {currentModule.transcript}
                  </p>
                </div>
              ) : (
                <p className="italic text-gray-600 dark:text-gray-400">
                  No transcript available for this module.
                </p>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="mx-auto max-w-4xl p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Resources</h2>
              {currentModule.resources && currentModule.resources.length > 0 ? (
                <div className="space-y-2">
                  {currentModule.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {resource.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {resource.type.toUpperCase()}
                            {resource.size && ` • ${resource.size}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-600 dark:text-gray-400">
                  No resources available for this module.
                </p>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="mx-auto max-w-4xl p-6">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">My Notes</h2>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Take notes while learning..."
                className="h-96 w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your notes are automatically saved.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Tab Navigation (Mobile) */}
        {responsive.isMobile && (
          <nav className="safe-bottom sticky bottom-0 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex flex-1 flex-col items-center gap-1 py-3 ${
                  activeTab === 'video'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <PlayCircle className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex flex-1 flex-col items-center gap-1 py-3 ${
                  activeTab === 'transcript'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Transcript</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex flex-1 flex-col items-center gap-1 py-3 ${
                  activeTab === 'resources'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Download className="h-5 w-5" />
                <span className="text-xs">Resources</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex flex-1 flex-col items-center gap-1 py-3 ${
                  activeTab === 'notes'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <StickyNote className="h-5 w-5" />
                <span className="text-xs">Notes</span>
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}
