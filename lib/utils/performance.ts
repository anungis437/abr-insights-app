/**
 * Performance Optimization Utilities
 *
 * Comprehensive utilities for optimizing web performance:
 * - Lazy loading with Intersection Observer
 * - Code splitting helpers
 * - Image optimization
 * - Resource preloading
 * - Performance monitoring
 * - Bundle size analysis integration
 */

import { logger } from './logger'

// =====================================================
// Lazy Loading Utilities
// =====================================================

export interface LazyLoadOptions {
  rootMargin?: string
  threshold?: number | number[]
  onLoad?: () => void
  onError?: () => void
}

/**
 * Create an Intersection Observer for lazy loading
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: LazyLoadOptions = {}
): IntersectionObserver {
  const { rootMargin = '50px', threshold = 0.1 } = options

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    },
    { rootMargin, threshold }
  )
}

/**
 * Lazy load images with blur placeholder
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: LazyLoadOptions = {}
): void {
  const observer = createLazyLoader((entry) => {
    const image = entry.target as HTMLImageElement
    image.src = src

    image.onload = () => {
      image.classList.add('loaded')
      options.onLoad?.()
      observer.disconnect()
    }

    image.onerror = () => {
      options.onError?.()
      observer.disconnect()
    }
  }, options)

  observer.observe(img)
}

/**
 * Lazy load background images
 */
export function lazyLoadBackground(
  element: HTMLElement,
  imageUrl: string,
  options: LazyLoadOptions = {}
): void {
  const observer = createLazyLoader((entry) => {
    const el = entry.target as HTMLElement
    const img = new Image()

    img.onload = () => {
      el.style.backgroundImage = `url(${imageUrl})`
      el.classList.add('loaded')
      options.onLoad?.()
      observer.disconnect()
    }

    img.onerror = () => {
      options.onError?.()
      observer.disconnect()
    }

    img.src = imageUrl
  }, options)

  observer.observe(element)
}

// =====================================================
// Code Splitting Helpers
// =====================================================

/**
 * Dynamically import a component with loading and error states
 */
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  onProgress?: (progress: number) => void
): Promise<T> {
  try {
    onProgress?.(0)
    const loadedModule = await importFn()
    onProgress?.(100)
    return loadedModule.default
  } catch (error) {
    console.error('[Dynamic Import] Failed to load module:', error)
    throw error
  }
}

/**
 * Preload a module without executing it
 */
export function preloadModule(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch((error) => {
        console.error('[Preload] Failed to preload module:', error)
      })
    })
  } else {
    setTimeout(() => {
      importFn().catch((error) => {
        console.error('[Preload] Failed to preload module:', error)
      })
    }, 1)
  }
}

/**
 * Route-based code splitting helper
 */
export function createRouteLoader(routes: Record<string, () => Promise<any>>) {
  return {
    load: async (route: string) => {
      const loader = routes[route]
      if (!loader) {
        throw new Error(`Route "${route}" not found`)
      }
      return dynamicImport(loader)
    },
    preload: (route: string) => {
      const loader = routes[route]
      if (loader) {
        preloadModule(loader)
      }
    },
    preloadAll: () => {
      Object.values(routes).forEach(preloadModule)
    },
  }
}

// =====================================================
// Image Optimization
// =====================================================

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  blur?: boolean
  blurAmount?: number
}

/**
 * Generate optimized image URL (for Next.js Image Optimization API)
 */
export function getOptimizedImageUrl(src: string, options: ImageOptimizationOptions = {}): string {
  const { width, height, quality = 75, format = 'webp' } = options

  // If using Next.js Image Optimization
  const params = new URLSearchParams()
  params.set('url', src)
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  params.set('fm', format)

  return `/_next/image?${params.toString()}`
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  // Simple SVG blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
      <rect width="${width}" height="${height}" fill="#ccc" filter="url(#blur)" />
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Get responsive image srcset
 */
export function getResponsiveSrcSet(src: string, sizes: number[]): string {
  return sizes.map((size) => `${getOptimizedImageUrl(src, { width: size })} ${size}w`).join(', ')
}

// =====================================================
// Resource Preloading
// =====================================================

export type ResourceType = 'script' | 'style' | 'font' | 'image' | 'video' | 'audio' | 'fetch'

export interface PreloadOptions {
  as: ResourceType
  crossOrigin?: 'anonymous' | 'use-credentials'
  type?: string
  media?: string
}

/**
 * Preload a resource
 */
export function preloadResource(href: string, options: PreloadOptions): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = options.as

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin
  }

  if (options.type) {
    link.type = options.type
  }

  if (options.media) {
    link.media = options.media
  }

  document.head.appendChild(link)
}

/**
 * Prefetch a resource for future navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href

  document.head.appendChild(link)
}

/**
 * DNS prefetch for external domains
 */
export function dnsPrefetch(domain: string): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = domain

  document.head.appendChild(link)
}

/**
 * Preconnect to external domains
 */
export function preconnect(domain: string, crossOrigin: boolean = false): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = domain

  if (crossOrigin) {
    link.crossOrigin = 'anonymous'
  }

  document.head.appendChild(link)
}

/**
 * Batch preload multiple resources
 */
export function batchPreload(resources: Array<{ href: string; options: PreloadOptions }>): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      resources.forEach(({ href, options }) => preloadResource(href, options))
    })
  } else {
    resources.forEach(({ href, options }) => preloadResource(href, options))
  }
}

// =====================================================
// Performance Monitoring
// =====================================================

export interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
  tti: number | null // Time to Interactive
}

/**
 * Measure Core Web Vitals
 */
export function measureWebVitals(
  callback: (metric: { name: string; value: number }) => void
): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  try {
    // First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          callback({ name: 'FCP', value: entry.startTime })
        }
      })
    })
    paintObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      callback({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        callback({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
        })
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          callback({ name: 'CLS', value: clsValue })
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
    console.error('[Performance Monitoring] Error:', error)
  }
}

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics(): Record<string, number> | null {
  if (typeof window === 'undefined' || !window.performance) return null

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!nav) return null

  return {
    dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
    tcpConnection: nav.connectEnd - nav.connectStart,
    tlsNegotiation: nav.requestStart - nav.secureConnectionStart,
    ttfb: nav.responseStart - nav.requestStart,
    contentDownload: nav.responseEnd - nav.responseStart,
    domProcessing: nav.domComplete - nav.domInteractive,
    domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
    loadEvent: nav.loadEventEnd - nav.loadEventStart,
    totalTime: nav.loadEventEnd - nav.fetchStart,
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string, callback: () => void): void {
  const startMark = `${componentName}-render-start`
  const endMark = `${componentName}-render-end`
  const measureName = `${componentName}-render`

  performance.mark(startMark)
  callback()
  performance.mark(endMark)

  performance.measure(measureName, startMark, endMark)

  const measure = performance.getEntriesByName(measureName)[0]
  logger.performance(`${componentName} render time`, measure.duration)

  // Clean up marks and measures
  performance.clearMarks(startMark)
  performance.clearMarks(endMark)
  performance.clearMeasures(measureName)
}

// =====================================================
// Bundle Size Monitoring
// =====================================================

/**
 * Log bundle size in development
 */
export function logBundleSize(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  const scripts = resources.filter((r) => r.name.includes('.js'))
  const styles = resources.filter((r) => r.name.includes('.css'))
  const images = resources.filter((r) => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name))

  const totalScriptSize = scripts.reduce((acc, r) => acc + (r.transferSize || 0), 0)
  const totalStyleSize = styles.reduce((acc, r) => acc + (r.transferSize || 0), 0)
  const totalImageSize = images.reduce((acc, r) => acc + (r.transferSize || 0), 0)

  logger.info('[Bundle Size Analysis]', {
    scripts: `${(totalScriptSize / 1024).toFixed(2)} KB (${scripts.length} files)`,
    styles: `${(totalStyleSize / 1024).toFixed(2)} KB (${styles.length} files)`,
    images: `${(totalImageSize / 1024).toFixed(2)} KB (${images.length} files)`,
    total: `${((totalScriptSize + totalStyleSize + totalImageSize) / 1024).toFixed(2)} KB`,
  })
}

/**
 * Check if bundle size exceeds threshold
 */
export function checkBundleSize(maxSizeKB: number = 500): boolean {
  if (typeof window === 'undefined') return true

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const scripts = resources.filter((r) => r.name.includes('.js'))
  const totalSize = scripts.reduce((acc, r) => acc + (r.transferSize || 0), 0) / 1024

  if (totalSize > maxSizeKB) {
    console.warn(
      `[Bundle Size] Warning: Total JS bundle size (${totalSize.toFixed(2)} KB) exceeds threshold (${maxSizeKB} KB)`
    )
    return false
  }

  return true
}

// =====================================================
// Debounce & Throttle Utilities
// =====================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// =====================================================
// Request Idle Callback Utilities
// =====================================================

/**
 * Execute callback during idle time
 */
export function runWhenIdle(callback: () => void, options?: IdleRequestOptions): void {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, options)
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Batch multiple tasks to run during idle time
 */
export function batchIdleTasks(tasks: Array<() => void>, options?: IdleRequestOptions): void {
  if (typeof window === 'undefined') {
    tasks.forEach((task) => task())
    return
  }

  let taskIndex = 0

  function runTask(deadline: IdleDeadline) {
    while (deadline.timeRemaining() > 0 && taskIndex < tasks.length) {
      tasks[taskIndex]()
      taskIndex++
    }

    if (taskIndex < tasks.length) {
      requestIdleCallback(runTask, options)
    }
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(runTask, options)
  } else {
    tasks.forEach((task) => setTimeout(task, 1))
  }
}
