'use client'

import { logger } from '@/lib/utils/production-logger'

import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  FileText,
  CheckCircle,
  Languages,
  StickyNote,
} from 'lucide-react'
import { trackLessonProgress, completeLessonProgress } from '@/lib/services/courses-enhanced'
import { startWatchSession, endWatchSession, getDeviceInfo } from '@/lib/services/watch-history'
import type { Lesson, Language } from '@/lib/types/courses'
import NotesPanel from './NotesPanel'

interface LessonPlayerProps {
  lesson: Lesson
  courseId: string
  enrollmentId?: string
  userId?: string
  onComplete?: () => void
  onNavigate?: (direction: 'previous' | 'next') => void
  hasPrevious?: boolean
  hasNext?: boolean
  className?: string
}

export function LessonPlayer({
  lesson,
  courseId,
  enrollmentId,
  userId,
  onComplete,
  onNavigate,
  hasPrevious = false,
  hasNext = false,
  className = '',
}: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptLanguage, setTranscriptLanguage] = useState<Language>('en')
  const [isCompleting, setIsCompleting] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showResumeNotification, setShowResumeNotification] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const watchSessionId = useRef<string | null>(null)
  const sessionStartTime = useRef<number>(0)

  useEffect(() => {
    // Reset state when lesson changes
    setCurrentTime(0)
    setIsPlaying(false)
    setShowTranscript(false)

    // Load bookmarked status if needed
    const bookmarks = JSON.parse(localStorage.getItem('lessonBookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(lesson.id))

    // Load saved playback speed
    const savedSpeed = localStorage.getItem('videoPlaybackSpeed')
    if (savedSpeed) {
      setPlaybackSpeed(parseFloat(savedSpeed))
    }

    // Load last watched position for auto-resume
    if (userId && lesson.content_type === 'video') {
      const progressKey = `lesson_progress_${userId}_${lesson.id}`
      const savedProgress = localStorage.getItem(progressKey)
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          if (progress.last_position_seconds && progress.last_position_seconds > 5) {
            // Auto-resume from last position if more than 5 seconds in
            setCurrentTime(progress.last_position_seconds)
            if (videoRef.current) {
              videoRef.current.currentTime = progress.last_position_seconds
            }
            // Show resume notification
            setShowResumeNotification(true)
            setTimeout(() => setShowResumeNotification(false), 3000)
          }
        } catch (e) {
          logger.error('Failed to parse saved progress:', { error: e, context: 'LessonPlayer' })
        }
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [lesson.id, userId, lesson.content_type])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const video = videoRef.current
      if (!video) return

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          if (isPlaying) {
            handleVideoPause()
          } else {
            handleVideoPlay()
          }
          break
        case 'arrowleft':
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case 'arrowright':
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case 'arrowup':
          e.preventDefault()
          setVolume((prev) => Math.min(1, prev + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume((prev) => Math.max(0, prev - 0.1))
          break
        case 'm':
          e.preventDefault()
          setIsMuted((prev) => !prev)
          break
        case 'f':
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else if (playerContainerRef.current) {
            playerContainerRef.current.requestFullscreen()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying])

  // Apply playback speed to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // Apply volume to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  useEffect(() => {
    // Track progress every 5 seconds while playing
    if (isPlaying && userId && enrollmentId) {
      progressInterval.current = setInterval(() => {
        if (duration === 0) return
        const progressPercentage = Math.round((currentTime / duration) * 100)
        const progressData = {
          last_position_seconds: Math.floor(currentTime),
          progress_percentage: progressPercentage,
        }

        // Save to localStorage for offline backup
        const progressKey = `lesson_progress_${userId}_${lesson.id}`
        localStorage.setItem(
          progressKey,
          JSON.stringify({
            ...progressData,
            lesson_id: lesson.id,
            updated_at: new Date().toISOString(),
          })
        )

        // Save to database
        trackLessonProgress(userId, lesson.id, enrollmentId, progressData)
          .then(() => {
            // Auto-complete if watched 95% or more
            if (progressPercentage >= 95 && !isCompleting) {
              setIsCompleting(true)
              completeLessonProgress(userId, lesson.id, enrollmentId)
                .then(() => {
                  onComplete?.()
                })
                .catch((error) => {
                  logger.error('Error completing lesson:', {
                    error: error,
                    context: 'LessonPlayer',
                  })
                })
            }
          })
          .catch((error) => {
            logger.error('Error updating progress:', { error: error, context: 'LessonPlayer' })
          })
      }, 5000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, currentTime, duration, userId, enrollmentId, lesson.id, isCompleting, onComplete])

  // Track watch session
  useEffect(() => {
    // Start watch session when video starts playing
    if (isPlaying && userId && lesson.content_type === 'video' && !watchSessionId.current) {
      const deviceInfo = getDeviceInfo()
      startWatchSession(userId, {
        lesson_id: lesson.id,
        enrollment_id: enrollmentId,
        course_id: courseId,
        start_position_seconds: Math.floor(currentTime),
        total_video_seconds: Math.floor(duration),
        ...deviceInfo,
      })
        .then((session) => {
          watchSessionId.current = session.id
          sessionStartTime.current = Date.now()
        })
        .catch((error) => {
          logger.error('Error starting watch session:', { error: error, context: 'LessonPlayer' })
        })
    }

    // End watch session when video stops or component unmounts
    return () => {
      if (watchSessionId.current && sessionStartTime.current > 0) {
        const watchDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000)
        const progressPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0

        endWatchSession(
          watchSessionId.current,
          currentTime,
          watchDuration,
          progressPercentage,
          progressPercentage >= 95
        ).catch((error) => {
          logger.error('Error ending watch session:', { error: error, context: 'LessonPlayer' })
        })

        watchSessionId.current = null
        sessionStartTime.current = 0
      }
    }
  }, [
    isPlaying,
    userId,
    lesson.id,
    lesson.content_type,
    enrollmentId,
    courseId,
    currentTime,
    duration,
  ])

  const loadBookmarkStatus = () => {
    // No longer needed - moved inline to useEffect
  }

  const updateProgress = async () => {
    if (!userId || !enrollmentId || duration === 0) return

    const progressPercentage = Math.round((currentTime / duration) * 100)

    try {
      await trackLessonProgress(userId, lesson.id, enrollmentId, {
        last_position_seconds: Math.floor(currentTime),
        progress_percentage: progressPercentage,
      })

      // Auto-complete if watched 95% or more
      if (progressPercentage >= 95) {
        await handleComplete()
      }
    } catch (error) {
      logger.error('Error updating progress:', { error: error, context: 'LessonPlayer' })
    }
  }

  const handleComplete = async () => {
    if (!userId || !enrollmentId || isCompleting) return

    try {
      setIsCompleting(true)
      await completeLessonProgress(userId, lesson.id, enrollmentId)
      onComplete?.()
    } catch (error) {
      logger.error('Error completing lesson:', { error: error, context: 'LessonPlayer' })
    } finally {
      setIsCompleting(false)
    }
  }

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('lessonBookmarks') || '[]')

    if (isBookmarked) {
      const filtered = bookmarks.filter((id: string) => id !== lesson.id)
      localStorage.setItem('lessonBookmarks', JSON.stringify(filtered))
      setIsBookmarked(false)
    } else {
      bookmarks.push(lesson.id)
      localStorage.setItem('lessonBookmarks', JSON.stringify(bookmarks))
      setIsBookmarked(true)
    }
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
    videoRef.current?.play()
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
    videoRef.current?.pause()
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      setCurrentTime(seconds)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderVideoContent = () => {
    if (!lesson.content_url) {
      return (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900">
          <p className="text-white">Video content not available</p>
        </div>
      )
    }

    // Handle different video providers
    if (lesson.video_provider === 'youtube' && lesson.video_id) {
      return (
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.video_id}?enablejsapi=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }

    if (lesson.video_provider === 'vimeo' && lesson.video_id) {
      return (
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            src={`https://player.vimeo.com/video/${lesson.video_id}`}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }

    // Default HTML5 video
    return (
      <div
        ref={playerContainerRef}
        className="group relative aspect-video overflow-hidden rounded-lg bg-black"
      >
        <video
          ref={videoRef}
          src={lesson.content_url}
          poster={lesson.thumbnail_url}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          controls
          className="h-full w-full"
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={() => (isPlaying ? handleVideoPause() : handleVideoPlay())}
                className="text-white transition-colors hover:text-blue-400"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white transition-colors hover:text-blue-400"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value)
                    setVolume(newVolume)
                    if (newVolume > 0) setIsMuted(false)
                  }}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  aria-label="Volume"
                />
              </div>

              {/* Time Display */}
              <div className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="min-w-[3rem] px-2 py-1 text-sm font-medium text-white transition-colors hover:text-blue-400"
                  aria-label="Playback speed"
                  aria-expanded={showSpeedMenu}
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 overflow-hidden rounded-lg bg-white shadow-lg">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed)
                          localStorage.setItem('videoPlaybackSpeed', speed.toString())
                          setShowSpeedMenu(false)
                        }}
                        className={`block w-full whitespace-nowrap px-4 py-2 text-left hover:bg-gray-100 ${
                          playbackSpeed === speed
                            ? 'bg-blue-50 font-medium text-blue-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {speed}x {speed === 1 && '(Normal)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={async () => {
                    try {
                      if (videoRef.current) {
                        if (document.pictureInPictureElement) {
                          await document.exitPictureInPicture()
                        } else {
                          await videoRef.current.requestPictureInPicture()
                        }
                      }
                    } catch (error) {
                      logger.error('Picture-in-Picture error:', {
                        error: error,
                        context: 'LessonPlayer',
                      })
                    }
                  }}
                  className="text-white transition-colors hover:text-blue-400"
                  aria-label="Picture in picture"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h18M3 16h18"
                    />
                    <rect x="13" y="12" width="7" height="5" strokeWidth={2} rx="1" />
                  </svg>
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen()
                  } else if (playerContainerRef.current) {
                    playerContainerRef.current.requestFullscreen()
                  }
                }}
                className="text-white transition-colors hover:text-blue-400"
                aria-label="Fullscreen"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderArticleContent = () => {
    return (
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: lesson.article_body || '' }} />
      </div>
    )
  }

  const renderTranscript = () => {
    const transcript = transcriptLanguage === 'en' ? lesson.transcript_en : lesson.transcript_fr

    if (!transcript) {
      return (
        <p className="text-sm text-gray-500">
          Transcript not available in {transcriptLanguage === 'en' ? 'English' : 'French'}.
        </p>
      )
    }

    return (
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap">{transcript}</div>
      </div>
    )
  }

  const hasMultilingualTranscript = lesson.transcript_en && lesson.transcript_fr

  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {/* Lesson Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  lesson.content_type === 'video'
                    ? 'bg-purple-100 text-purple-800'
                    : lesson.content_type === 'quiz'
                      ? 'bg-yellow-100 text-yellow-800'
                      : lesson.content_type === 'article'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {lesson.content_type}
              </span>

              {lesson.ce_credits && lesson.ce_credits > 0 && (
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {lesson.ce_credits} CE Credits
                </span>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">{lesson.title}</h1>

            {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}

            {/* Lesson Meta */}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              {lesson.video_duration_seconds && (
                <span>Duration: {formatTime(lesson.video_duration_seconds)}</span>
              )}
              {lesson.estimated_read_time_minutes && (
                <span>{lesson.estimated_read_time_minutes} min read</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {lesson.content_type === 'video' && userId && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 transition-colors ${
                  showNotes
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-400 hover:text-blue-600'
                }`}
                aria-label={showNotes ? 'Hide notes' : 'Show notes'}
                title={showNotes ? 'Hide notes' : 'Show notes'}
              >
                <StickyNote className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={toggleBookmark}
              className="p-2 text-gray-400 transition-colors hover:text-yellow-500"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>

            {userId && enrollmentId && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Mark lesson as complete"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isCompleting ? 'Completing...' : 'Mark Complete'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resume Notification Toast */}
      {showResumeNotification && (
        <div
          className="fixed right-4 top-4 z-50 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            <span className="font-medium">Resuming from where you left off</span>
          </div>
        </div>
      )}

      {/* Lesson Content */}
      <div className="p-6">
        {lesson.content_type === 'video' && renderVideoContent()}
        {lesson.content_type === 'article' && renderArticleContent()}

        {/* Interactive/Quiz types would have their own renderers */}
        {lesson.content_type === 'quiz' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-800">Quiz component will be loaded here</p>
          </div>
        )}
      </div>

      {/* Notes Panel */}
      {showNotes && userId && lesson.content_type === 'video' && (
        <div className="border-t border-gray-200 p-6">
          <NotesPanel
            lessonId={lesson.id}
            enrollmentId={enrollmentId}
            userId={userId}
            currentTime={currentTime}
            onSeekTo={handleSeekTo}
            isVisible={showNotes}
          />
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {lesson.content_type === 'video' &&
        !lesson.video_provider?.startsWith('youtube') &&
        !lesson.video_provider?.startsWith('vimeo') && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">Keyboard Shortcuts</span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    Space
                  </kbd>
                  <span className="text-gray-600">Play/Pause</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    â†
                  </kbd>
                  <span className="text-gray-600">Rewind 10s</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    â†’
                  </kbd>
                  <span className="text-gray-600">Forward 10s</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    â†‘
                  </kbd>
                  <span className="text-gray-600">Volume Up</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    â†“
                  </kbd>
                  <span className="text-gray-600">Volume Down</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    M
                  </kbd>
                  <span className="text-gray-600">Mute/Unmute</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
                    F
                  </kbd>
                  <span className="text-gray-600">Fullscreen</span>
                </div>
              </div>
            </details>
          </div>
        )}

      {/* Transcript Section */}
      {(lesson.transcript_en || lesson.transcript_fr) && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
            aria-expanded={showTranscript}
            aria-controls="lesson-transcript"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Transcript</span>
            </div>
            <ChevronRight
              className={`h-5 w-5 text-gray-400 transition-transform ${
                showTranscript ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showTranscript && (
            <div id="lesson-transcript" className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              {/* Language Toggle */}
              {hasMultilingualTranscript && (
                <div className="mb-4 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <div className="flex gap-2" role="group" aria-label="Select transcript language">
                    <button
                      onClick={() => setTranscriptLanguage('en')}
                      className={`rounded px-3 py-1 text-sm transition-colors ${
                        transcriptLanguage === 'en'
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      aria-pressed={transcriptLanguage === 'en'}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setTranscriptLanguage('fr')}
                      className={`rounded px-3 py-1 text-sm transition-colors ${
                        transcriptLanguage === 'fr'
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      aria-pressed={transcriptLanguage === 'fr'}
                    >
                      FranÃ§ais
                    </button>
                  </div>
                </div>
              )}

              {renderTranscript()}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      {(hasPrevious || hasNext) && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => onNavigate?.('previous')}
            disabled={!hasPrevious}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Go to previous lesson"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-medium">Previous</span>
          </button>

          <button
            onClick={() => onNavigate?.('next')}
            disabled={!hasNext}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Go to next lesson"
          >
            <span className="font-medium">Next Lesson</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
