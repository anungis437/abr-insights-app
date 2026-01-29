'use client'

import { useState, useEffect, useCallback } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type Orientation = 'portrait' | 'landscape'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface ResponsiveState {
  width: number
  height: number
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: Orientation
  deviceType: DeviceType
  isTouch: boolean
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

function getDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
        deviceType: 'desktop',
        isTouch: false,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const breakpoint = getBreakpoint(width)
    const deviceType = getDeviceType(width)
    const orientation = width > height ? 'landscape' : 'portrait'
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    return {
      width,
      height,
      breakpoint,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      orientation,
      deviceType,
      isTouch,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const breakpoint = getBreakpoint(width)
      const deviceType = getDeviceType(width)
      const orientation = width > height ? 'landscape' : 'portrait'
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setState({
        width,
        height,
        breakpoint,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        orientation,
        deviceType,
        isTouch,
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return state
}

// =====================================================
// Media Query Hook
// =====================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// =====================================================
// Viewport Hook (with safe area insets for notches)
// =====================================================

export interface ViewportInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export function useViewportInsets(): ViewportInsets {
  const [insets, setInsets] = useState<ViewportInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      })
    }

    updateInsets()
    window.addEventListener('resize', updateInsets)
    return () => window.removeEventListener('resize', updateInsets)
  }, [])

  return insets
}

// =====================================================
// Lazy Loading Hook
// =====================================================

export function useLazyLoad<T extends HTMLElement>(): {
  ref: React.RefObject<T>
  isVisible: boolean
} {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<T | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref])

  const callbackRef = useCallback((node: T | null) => {
    if (node) setRef(node)
  }, [])

  return {
    ref: { current: ref } as React.RefObject<T>,
    isVisible,
  }
}

// =====================================================
// Network Information Hook
// =====================================================

export interface NetworkState {
  online: boolean
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
}

export function useNetworkInformation(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return {
        online: true,
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      }
    }

    const conn = (navigator as any).connection
    return {
      online: navigator.onLine,
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 50,
      saveData: conn?.saveData || false,
    }
  })

  useEffect(() => {
    const updateNetworkState = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        setNetworkState({
          online: navigator.onLine,
          effectiveType: conn?.effectiveType || '4g',
          downlink: conn?.downlink || 10,
          rtt: conn?.rtt || 50,
          saveData: conn?.saveData || false,
        })
      } else {
        setNetworkState((prev) => ({ ...prev, online: navigator.onLine }))
      }
    }

    window.addEventListener('online', updateNetworkState)
    window.addEventListener('offline', updateNetworkState)

    if ('connection' in navigator) {
      ;(navigator as any).connection.addEventListener('change', updateNetworkState)
    }

    return () => {
      window.removeEventListener('online', updateNetworkState)
      window.removeEventListener('offline', updateNetworkState)

      if ('connection' in navigator) {
        ;(navigator as any).connection.removeEventListener('change', updateNetworkState)
      }
    }
  }, [])

  return networkState
}

// =====================================================
// Performance Monitoring Hook
// =====================================================

export interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Observe FCP and LCP
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics((prev) => ({ ...prev, fcp: entry.startTime }))
          }
        }
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        setMetrics((prev) => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any
          setMetrics((prev) => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Observe CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            setMetrics((prev) => ({ ...prev, cls: clsValue }))
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Get TTFB from Navigation Timing
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry) {
        // Use flushSync-safe approach by scheduling state update
        Promise.resolve().then(() => {
          setMetrics((prev) => ({ ...prev, ttfb: navEntry.responseStart - navEntry.requestStart }))
        })
      }

      return () => {
        paintObserver.disconnect()
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    } catch (error) {
      console.error('[Performance] Failed to observe metrics:', error)
    }
  }, [])

  return metrics
}
