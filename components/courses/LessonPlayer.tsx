'use client'

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
  Languages
} from 'lucide-react'
import { trackLessonProgress, completeLessonProgress } from '@/lib/services/courses-enhanced'
import type { Lesson, Language } from '@/lib/types/courses'

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
  className = ''
}: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptLanguage, setTranscriptLanguage] = useState<Language>('en')
  const [isCompleting, setIsCompleting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Reset state when lesson changes
    setCurrentTime(0)
    setIsPlaying(false)
    setShowTranscript(false)
    
    // Load bookmarked status if needed
    const bookmarks = JSON.parse(localStorage.getItem('lessonBookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(lesson.id))

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [lesson.id])

  useEffect(() => {
    // Track progress every 5 seconds while playing
    if (isPlaying && userId && enrollmentId) {
      progressInterval.current = setInterval(() => {
        if (duration === 0) return
        const progressPercentage = Math.round((currentTime / duration) * 100)
        
        trackLessonProgress(userId, lesson.id, enrollmentId, {
          last_position_seconds: Math.floor(currentTime),
          progress_percentage: progressPercentage
        }).then(() => {
          // Auto-complete if watched 95% or more
          if (progressPercentage >= 95 && !isCompleting) {
            completeLessonProgress(userId, lesson.id, enrollmentId).then(() => {
              onComplete?.()
            }).catch(error => {
              console.error('Error completing lesson:', error)
            })
          }
        }).catch(error => {
          console.error('Error updating progress:', error)
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

  const loadBookmarkStatus = () => {
    // No longer needed - moved inline to useEffect
  }

  const updateProgress = async () => {
    if (!userId || !enrollmentId || duration === 0) return

    const progressPercentage = Math.round((currentTime / duration) * 100)
    
    try {
      await trackLessonProgress(userId, lesson.id, enrollmentId, {
        last_position_seconds: Math.floor(currentTime),
        progress_percentage: progressPercentage
      })

      // Auto-complete if watched 95% or more
      if (progressPercentage >= 95) {
        await handleComplete()
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleComplete = async () => {
    if (!userId || !enrollmentId || isCompleting) return

    try {
      setIsCompleting(true)
      await completeLessonProgress(userId, lesson.id, enrollmentId)
      onComplete?.()
    } catch (error) {
      console.error('Error completing lesson:', error)
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderVideoContent = () => {
    if (!lesson.content_url) {
      return (
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-white">Video content not available</p>
        </div>
      )
    }

    // Handle different video providers
    if (lesson.video_provider === 'youtube' && lesson.video_id) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.video_id}?enablejsapi=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )
    }

    if (lesson.video_provider === 'vimeo' && lesson.video_id) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${lesson.video_id}`}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )
    }

    // Default HTML5 video
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={lesson.content_url}
          poster={lesson.thumbnail_url}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          controls
          className="w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
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
    const transcript = transcriptLanguage === 'en' 
      ? lesson.transcript_en 
      : lesson.transcript_fr

    if (!transcript) {
      return (
        <p className="text-gray-500 text-sm">
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Lesson Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                lesson.content_type === 'video' ? 'bg-purple-100 text-purple-800' :
                lesson.content_type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                lesson.content_type === 'article' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {lesson.content_type}
              </span>
              
              {lesson.ce_credits && lesson.ce_credits > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {lesson.ce_credits} CE Credits
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="text-gray-600 mt-2">
                {lesson.description}
              </p>
            )}

            {/* Lesson Meta */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
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
            <button
              onClick={toggleBookmark}
              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-yellow-500" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            {userId && enrollmentId && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Mark lesson as complete"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isCompleting ? 'Completing...' : 'Mark Complete'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        {lesson.content_type === 'video' && renderVideoContent()}
        {lesson.content_type === 'article' && renderArticleContent()}
        
        {/* Interactive/Quiz types would have their own renderers */}
        {lesson.content_type === 'quiz' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">
              Quiz component will be loaded here
            </p>
          </div>
        )}
      </div>

      {/* Transcript Section */}
      {(lesson.transcript_en || lesson.transcript_fr) && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            aria-expanded={showTranscript ? 'true' : 'false'}
            aria-controls="lesson-transcript"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Transcript</span>
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showTranscript ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showTranscript && (
            <div 
              id="lesson-transcript" 
              className="px-6 py-4 bg-gray-50 border-t border-gray-200"
            >
              {/* Language Toggle */}
              {hasMultilingualTranscript && (
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-4 h-4 text-gray-500" />
                  <div className="flex gap-2" role="group" aria-label="Select transcript language">
                    <button
                      onClick={() => setTranscriptLanguage('en')}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        transcriptLanguage === 'en'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-pressed={transcriptLanguage === 'en' ? 'true' : 'false'}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setTranscriptLanguage('fr')}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        transcriptLanguage === 'fr'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-pressed={transcriptLanguage === 'fr' ? 'true' : 'false'}
                    >
                      Français
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onNavigate?.('previous')}
            disabled={!hasPrevious}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to previous lesson"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Previous</span>
          </button>

          <button
            onClick={() => onNavigate?.('next')}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to next lesson"
          >
            <span className="font-medium">Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
