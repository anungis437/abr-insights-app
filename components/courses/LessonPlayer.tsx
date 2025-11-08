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
  Languages,
  StickyNote
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
  className = ''
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
          console.error('Failed to parse saved progress:', e)
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

      switch(e.key.toLowerCase()) {
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
          setVolume(prev => Math.min(1, prev + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume(prev => Math.max(0, prev - 0.1))
          break
        case 'm':
          e.preventDefault()
          setIsMuted(prev => !prev)
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
          progress_percentage: progressPercentage
        }
        
        // Save to localStorage for offline backup
        const progressKey = `lesson_progress_${userId}_${lesson.id}`
        localStorage.setItem(progressKey, JSON.stringify({
          ...progressData,
          lesson_id: lesson.id,
          updated_at: new Date().toISOString()
        }))
        
        // Save to database
        trackLessonProgress(userId, lesson.id, enrollmentId, progressData).then(() => {
          // Auto-complete if watched 95% or more
          if (progressPercentage >= 95 && !isCompleting) {
            setIsCompleting(true)
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
        ...deviceInfo
      }).then(session => {
        watchSessionId.current = session.id
        sessionStartTime.current = Date.now()
      }).catch(error => {
        console.error('Error starting watch session:', error)
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
        ).catch(error => {
          console.error('Error ending watch session:', error)
        })
        
        watchSessionId.current = null
        sessionStartTime.current = 0
      }
    }
  }, [isPlaying, userId, lesson.id, lesson.content_type, enrollmentId, courseId, currentTime, duration])

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
      <div ref={playerContainerRef} className="aspect-video rounded-lg overflow-hidden bg-black relative group">
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
        
        {/* Custom Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={() => isPlaying ? handleVideoPause() : handleVideoPlay()}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-blue-400 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  aria-label="Volume"
                />
              </div>
              
              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="text-white hover:text-blue-400 transition-colors px-2 py-1 text-sm font-medium min-w-[3rem]"
                  aria-label="Playback speed"
                  aria-expanded={showSpeedMenu}
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg overflow-hidden">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed)
                          localStorage.setItem('videoPlaybackSpeed', speed.toString())
                          setShowSpeedMenu(false)
                        }}
                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 whitespace-nowrap ${
                          playbackSpeed === speed ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
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
                      console.error('Picture-in-Picture error:', error)
                    }
                  }}
                  className="text-white hover:text-blue-400 transition-colors"
                  aria-label="Picture in picture"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
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
                className="text-white hover:text-blue-400 transition-colors"
                aria-label="Fullscreen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
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
                <StickyNote className="w-5 h-5" />
              </button>
            )}
            
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

      {/* Resume Notification Toast */}
      {showResumeNotification && (
        <div 
          className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">
              Quiz component will be loaded here
            </p>
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
      {lesson.content_type === 'video' && !lesson.video_provider?.startsWith('youtube') && !lesson.video_provider?.startsWith('vimeo') && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Keyboard Shortcuts</span>
            </summary>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Space</kbd>
                <span className="text-gray-600">Play/Pause</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">←</kbd>
                <span className="text-gray-600">Rewind 10s</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">→</kbd>
                <span className="text-gray-600">Forward 10s</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↑</kbd>
                <span className="text-gray-600">Volume Up</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↓</kbd>
                <span className="text-gray-600">Volume Down</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">M</kbd>
                <span className="text-gray-600">Mute/Unmute</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">F</kbd>
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
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            aria-expanded={showTranscript}
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
                      aria-pressed={transcriptLanguage === 'en'}
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
                      aria-pressed={transcriptLanguage === 'fr'}
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
