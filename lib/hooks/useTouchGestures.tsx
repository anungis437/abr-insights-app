'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
}

export interface TouchGestureOptions {
  swipeThreshold?: number // minimum distance for swipe (pixels)
  pinchThreshold?: number // minimum scale change for pinch
  longPressDelay?: number // delay for long press (ms)
  preventScroll?: boolean // prevent default scroll behavior
}

export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    preventScroll = false,
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number } | null>(null)
  const pinchStartRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    touchEndRef.current = null

    // Handle pinch gesture
    if (e.touches.length === 2 && handlers.onPinch) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      pinchStartRef.current = distance
    }

    // Handle long press
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.()
      }, longPressDelay)
    }
  }, [handlers, longPressDelay, preventScroll])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && handlers.onPinch && pinchStartRef.current) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      const scale = distance / pinchStartRef.current
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        handlers.onPinch(scale)
      }
    }

    const touch = e.touches[0]
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }, [handlers, pinchThreshold, preventScroll])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    // Cancel long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Reset pinch
    pinchStartRef.current = null

    if (!touchStartRef.current || !touchEndRef.current) {
      // Check for double tap
      const now = Date.now()
      if (now - lastTapRef.current < 300 && handlers.onDoubleTap) {
        handlers.onDoubleTap()
      }
      lastTapRef.current = now
      return
    }

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Determine swipe direction
    if (absX > swipeThreshold || absY > swipeThreshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight()
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown()
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp()
        }
      }
    }

    touchStartRef.current = null
    touchEndRef.current = null
  }, [handlers, swipeThreshold, preventScroll])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

// =====================================================
// Swipeable Container Component
// =====================================================

interface SwipeableContainerProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
  swipeThreshold?: number
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  swipeThreshold = 50,
}: SwipeableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [swipeIndicator, setSwipeIndicator] = useState<{
    direction: 'left' | 'right' | 'up' | 'down' | null
    progress: number
  }>({ direction: null, progress: 0 })

  const gestureHandlers = useTouchGestures(
    {
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    },
    { swipeThreshold }
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    element.addEventListener('touchstart', gestureHandlers.onTouchStart as any)
    element.addEventListener('touchmove', gestureHandlers.onTouchMove as any)
    element.addEventListener('touchend', gestureHandlers.onTouchEnd as any)

    return () => {
      element.removeEventListener('touchstart', gestureHandlers.onTouchStart as any)
      element.removeEventListener('touchmove', gestureHandlers.onTouchMove as any)
      element.removeEventListener('touchend', gestureHandlers.onTouchEnd as any)
    }
  }, [gestureHandlers])

  return (
    <div ref={containerRef} className={`relative touch-pan-y ${className}`}>
      {children}
      
      {/* Swipe Indicator */}
      {swipeIndicator.direction && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`px-6 py-3 rounded-full bg-black/50 text-white font-medium transition-opacity ${
              swipeIndicator.progress > 0.5 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {swipeIndicator.direction === 'left' && '← Swipe Left'}
            {swipeIndicator.direction === 'right' && 'Swipe Right →'}
            {swipeIndicator.direction === 'up' && '↑ Swipe Up'}
            {swipeIndicator.direction === 'down' && 'Swipe Down ↓'}
          </div>
        </div>
      )}
    </div>
  )
}

// =====================================================
// Pinch-to-Zoom Image Component
// =====================================================

interface PinchZoomImageProps {
  src: string
  alt: string
  className?: string
  maxScale?: number
  minScale?: number
}

export function PinchZoomImage({
  src,
  alt,
  className = '',
  maxScale = 3,
  minScale = 1,
}: PinchZoomImageProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const handlePinch = useCallback((newScale: number) => {
    setScale((prev) => {
      const updatedScale = prev * newScale
      return Math.max(minScale, Math.min(maxScale, updatedScale))
    })
  }, [maxScale, minScale])

  const handleDoubleTap = useCallback(() => {
    setScale((prev) => (prev > 1 ? 1 : 2))
    setPosition({ x: 0, y: 0 })
  }, [])

  const gestureHandlers = useTouchGestures(
    {
      onPinch: handlePinch,
      onDoubleTap: handleDoubleTap,
    },
    { preventScroll: scale > 1 }
  )

  useEffect(() => {
    const element = imageRef.current
    if (!element) return

    element.addEventListener('touchstart', gestureHandlers.onTouchStart as any)
    element.addEventListener('touchmove', gestureHandlers.onTouchMove as any)
    element.addEventListener('touchend', gestureHandlers.onTouchEnd as any)

    return () => {
      element.removeEventListener('touchstart', gestureHandlers.onTouchStart as any)
      element.removeEventListener('touchmove', gestureHandlers.onTouchMove as any)
      element.removeEventListener('touchend', gestureHandlers.onTouchEnd as any)
    }
  }, [gestureHandlers])

  return (
    <div className="relative overflow-hidden touch-none">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`transition-transform duration-200 ${className}`}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
        }}
      />
      {scale > 1 && (
        <button
          onClick={() => {
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
          className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-lg hover:bg-black/70 transition-colors"
        >
          Reset Zoom
        </button>
      )}
    </div>
  )
}
