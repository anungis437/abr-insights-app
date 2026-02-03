'use client'

import { logger } from '@/lib/utils/production-logger'

import React, { useRef, useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
} from 'lucide-react'
import { useOnlineStatus } from '@/lib/hooks/usePWA'

interface MobileVideoPlayerProps {
  src: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
  initialProgress?: number
  enableDownload?: boolean
  courseId?: string
}

export default function MobileVideoPlayer({
  src,
  title,
  onProgress,
  onComplete,
  initialProgress = 0,
  enableDownload = true,
  courseId,
}: MobileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto')
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const isOnline = useOnlineStatus()
  const [connectionType, setConnectionType] = useState<string>(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection
      return conn.effectiveType || '4g'
    }
    return '4g'
  })

  useEffect(() => {
    // Detect network connection type changes
    if ('connection' in navigator) {
      const conn = (navigator as any).connection

      const handleChange = () => {
        setConnectionType(conn.effectiveType || '4g')
      }

      conn.addEventListener('change', handleChange)
      return () => conn.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    // Auto-adjust quality based on connection
    if (quality === 'auto') {
      if (connectionType === '2g' || connectionType === 'slow-2g') {
        // Use lowest quality for 2G
        if (videoRef.current) {
          videoRef.current.playbackRate = 1
        }
      } else if (connectionType === '3g') {
        // Medium quality for 3G
        if (videoRef.current) {
          videoRef.current.playbackRate = 1
        }
      }
    }
  }, [connectionType, quality])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial progress
    if (initialProgress > 0) {
      video.currentTime = (initialProgress / 100) * video.duration
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(0) / video.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [initialProgress, onComplete])

  useEffect(() => {
    // Report progress every 5 seconds
    if (isPlaying && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
          onProgress(progress)
        }
      }, 5000)
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, onProgress])

  useEffect(() => {
    // Hide controls after 3 seconds of inactivity
    let timeout: NodeJS.Timeout
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        }
        setIsFullscreen(true)

        // Lock orientation to landscape in fullscreen
        if ('orientation' in screen && 'lock' in (screen.orientation as any)) {
          try {
            await (screen.orientation as any).lock('landscape')
          } catch (e) {
            logger.debug('Orientation lock not supported', { error: e })
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      logger.error('Fullscreen toggle failed:', { error: error, context: 'MobileVideoPlayer' })
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
      setIsMuted(vol === 0)
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      )
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full bg-black"
      onTouchStart={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full"
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="absolute right-4 top-4 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white">
          Offline Mode
        </div>
      )}

      {/* Connection Speed Indicator */}
      {isOnline &&
        (connectionType === '2g' || connectionType === 'slow-2g' || connectionType === '3g') && (
          <div className="absolute left-4 top-4 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white">
            {connectionType.toUpperCase()} Connection
          </div>
        )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute left-0 right-0 top-0 p-4">
          <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
              aria-label="Play video"
            >
              <Play className="ml-1 h-10 w-10 text-gray-900" fill="currentColor" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
          {/* Progress Bar */}
          <div className="relative">
            {/* Buffered Progress */}
            <div className="absolute inset-0 h-1 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/40 transition-all"
                style={{ width: `${buffered}%` }}
              />
            </div>

            {/* Watched Progress */}
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={handleSeek}
              className="absolute inset-0 h-1 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              aria-label="Video progress"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${progressPercent}%, transparent ${progressPercent}%)`,
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white transition-colors hover:text-blue-400"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              {/* Skip Back */}
              <button
                onClick={() => skip(-10)}
                className="text-white transition-colors hover:text-blue-400"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack size={24} />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="text-white transition-colors hover:text-blue-400"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward size={24} />
              </button>

              {/* Time Display */}
              <div className="text-sm font-medium text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={toggleMute}
                  className="text-white transition-colors hover:text-blue-400"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  aria-label="Volume control"
                />
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white transition-colors hover:text-blue-400"
                aria-label="Settings"
              >
                <Settings size={24} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white transition-colors hover:text-blue-400"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        {showSettings && (
          <div className="absolute bottom-20 right-4 overflow-hidden rounded-lg bg-gray-900 shadow-xl">
            <div className="space-y-1 p-2">
              <div className="border-b border-gray-700 px-3 py-2 text-sm font-medium text-white">
                Playback Speed
              </div>
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    changePlaybackRate(rate)
                    setShowSettings(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    playbackRate === rate
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {rate}x {rate === 1 && '(Normal)'}
                </button>
              ))}

              {enableDownload && (
                <>
                  <div className="border-b border-t border-gray-700 px-3 py-2 text-sm font-medium text-white">
                    Quality
                  </div>
                  {(['auto', 'high', 'medium', 'low'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q)
                        setShowSettings(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm capitalize transition-colors ${
                        quality === q ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
