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
  Award
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
  const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'resources' | 'notes'>('video')
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
    const completed = modules.filter(m => m.completed).length
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
        showModuleSheet ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setShowModuleSheet(false)}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[70vh] overflow-y-auto transition-transform ${
          showModuleSheet ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Course Modules
            </h3>
            <button
              onClick={() => setShowModuleSheet(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {modules.filter(m => m.completed).length} of {modules.length} completed
          </p>
        </div>

        {/* Module List */}
        <div className="p-4 space-y-2">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => {
                onModuleChange(index)
                setShowModuleSheet(false)
              }}
              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                index === currentModuleIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {module.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : index === currentModuleIndex ? (
                <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {index + 1}. {module.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
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
      } w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute'
      }`}
    >
      {/* Course Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </Link>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {courseTitle}
        </h2>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Course Progress</span>
            <span>{calculateCourseProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${calculateCourseProgress()}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-xs">
            <p className="text-gray-600 dark:text-gray-400">Total Duration</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(getTotalDuration())}
            </p>
          </div>
          <div className="text-xs">
            <p className="text-gray-600 dark:text-gray-400">Modules</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {modules.length}
            </p>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="p-2">
        {modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(index)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors mb-1 ${
              index === currentModuleIndex
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {module.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : index === currentModuleIndex ? (
              <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {index + 1}. {module.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatDuration(module.duration)}
              </p>
              {module.currentProgress && module.currentProgress > 0 && !module.completed && (
                <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Progress Bar (Sticky) */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${calculateCourseProgress()}%` } as React.CSSProperties}
            />
          </div>
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() => responsive.isMobile ? setShowModuleSheet(true) : setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 px-3 min-w-0">
              <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentModule.title}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Module {currentModuleIndex + 1} of {modules.length}
              </p>
            </div>
            {modules.filter(m => m.completed).length === modules.length && (
              <Award className="w-6 h-6 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player (Full Width on Mobile) */}
          {activeTab === 'video' && (
            <div className={`${responsive.isMobile ? 'w-full' : 'max-w-5xl mx-auto p-6'}`}>
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
              <div className="flex items-center justify-between mt-4 px-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
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
              <div className="flex items-center justify-between mt-6 px-4 pb-4">
                <button
                  onClick={handlePreviousModule}
                  disabled={!hasPrevious}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNextModule}
                  disabled={!hasNext}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transcript Tab */}
          {activeTab === 'transcript' && (
            <div className="max-w-4xl mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Transcript
              </h2>
              {currentModule.transcript ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {currentModule.transcript}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No transcript available for this module.
                </p>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="max-w-4xl mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Resources
              </h2>
              {currentModule.resources && currentModule.resources.length > 0 ? (
                <div className="space-y-2">
                  {currentModule.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No resources available for this module.
                </p>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                My Notes
              </h2>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Take notes while learning..."
                className="w-full h-96 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Your notes are automatically saved.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Tab Navigation (Mobile) */}
        {responsive.isMobile && (
          <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  activeTab === 'video'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                <span className="text-xs">Video</span>
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  activeTab === 'transcript'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Transcript</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  activeTab === 'resources'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs">Resources</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 flex flex-col items-center gap-1 py-3 ${
                  activeTab === 'notes'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <StickyNote className="w-5 h-5" />
                <span className="text-xs">Notes</span>
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}
