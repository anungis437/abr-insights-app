/**
 * PWA Hooks and Utilities
 * Manages service worker registration, offline detection, installation prompts
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { logger } from '@/lib/utils/logger'

// =====================================================
// Types
// =====================================================

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
  canInstall: boolean
}

export interface CacheStatus {
  usage: number
  quota: number
  percentage: string
}

export interface DownloadedCourse {
  courseId: string
  title: string
  downloadedAt: string
  size: number
}

// =====================================================
// Service Worker Hook
// =====================================================

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          logger.info('[PWA] Service Worker registered', { scope: reg.scope })
          setRegistration(reg)

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true)
                }
              })
            }
          })

          // Check for updates every hour
          setInterval(
            () => {
              reg.update()
            },
            60 * 60 * 1000
          )
        })
        .catch((err) => {
          console.error('[PWA] Service Worker registration failed:', err)
          setError(err)
        })
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  return {
    registration,
    isUpdateAvailable,
    updateServiceWorker,
    error,
  }
}

// =====================================================
// Online/Offline Detection
// =====================================================

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      logger.info('[PWA] Back online')

      // Trigger sync
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((reg) => {
          // @ts-expect-error - Background Sync API not in TypeScript types yet
          if (reg.sync) {
            // @ts-expect-error - Background Sync API not in TypeScript types yet
            reg.sync.register('sync-quiz-attempts')
            // @ts-expect-error - Background Sync API not in TypeScript types yet
            reg.sync.register('sync-course-progress')
          }
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      logger.info('[PWA] Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// =====================================================
// Install Prompt Hook
// =====================================================

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false
  )

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      logger.info('[PWA] Install prompt available')
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      logger.info('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      console.warn('[PWA] Install prompt not available')
      return false
    }

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    logger.info('[PWA] Install prompt outcome', { outcome })

    if (outcome === 'accepted') {
      setInstallPrompt(null)
      return true
    }

    return false
  }, [installPrompt])

  return {
    canInstall: !!installPrompt,
    isInstalled,
    promptInstall,
  }
}

// =====================================================
// Push Notifications Hook
// =====================================================

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  )
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [])

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PWA] Push notifications not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Get existing subscription or create new one
      let sub = await registration.pushManager.getSubscription()

      if (!sub) {
        // You'll need to generate VAPID keys and add your public key here
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        })
      }

      setSubscription(sub)

      // Send subscription to your backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      return sub
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push:', error)
      return null
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe()
        setSubscription(null)

        // Notify backend
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      } catch (error) {
        console.error('[PWA] Failed to unsubscribe:', error)
      }
    }
  }, [subscription])

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  }
}

// =====================================================
// Course Download Hook
// =====================================================

export function useCourseDownload() {
  const [downloadedCourses, setDownloadedCourses] = useState<DownloadedCourse[]>([])
  const [downloading, setDownloading] = useState<string[]>([])

  const loadDownloadedCourses = useCallback(async () => {
    try {
      const db = await openDB()
      const courses = await getAllFromStore(db, 'downloadedCourses')
      setDownloadedCourses(courses)
    } catch (error) {
      console.error('[PWA] Failed to load downloaded courses:', error)
    }
  }, [])

  useEffect(() => {
    loadDownloadedCourses()
  }, [loadDownloadedCourses])

  const downloadCourse = useCallback(
    async (courseId: string) => {
      if (downloading.includes(courseId)) return

      setDownloading((prev) => [...prev, courseId])

      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          registration.active?.postMessage({
            type: 'CACHE_COURSE',
            courseId,
          })

          // Wait a bit for the download to complete
          setTimeout(() => {
            loadDownloadedCourses()
            setDownloading((prev) => prev.filter((id) => id !== courseId))
          }, 2000)
        }
      } catch (error) {
        console.error('[PWA] Failed to download course:', error)
        setDownloading((prev) => prev.filter((id) => id !== courseId))
      }
    },
    [downloading]
  )

  const removeCourse = useCallback(async (courseId: string) => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({
          type: 'REMOVE_COURSE_CACHE',
          courseId,
        })

        await loadDownloadedCourses()
      }
    } catch (error) {
      console.error('[PWA] Failed to remove course:', error)
    }
  }, [])

  const isDownloaded = useCallback(
    (courseId: string) => downloadedCourses.some((c) => c.courseId === courseId),
    [downloadedCourses]
  )

  return {
    downloadedCourses,
    downloading,
    downloadCourse,
    removeCourse,
    isDownloaded,
    refresh: loadDownloadedCourses,
  }
}

// =====================================================
// Cache Management Hook
// =====================================================

export function useCacheManagement() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    usage: 0,
    quota: 0,
    percentage: '0',
  })

  const checkCacheSize = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }
    
    try {
      const registration = await navigator.serviceWorker.ready

      // MessageChannel is not available in Edge Runtime, only use in browser
      if (typeof MessageChannel === 'undefined') {
        return
      }

      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          setCacheStatus(event.data.size)
        }
      }

      registration.active?.postMessage({ type: 'GET_CACHE_SIZE' }, [messageChannel.port2])
    } catch (error) {
      console.error('Failed to check cache size:', error)
    }
  }, [])

  const clearAllCaches = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.active?.postMessage({ type: 'CLEAR_ALL_CACHES' })

      setTimeout(() => {
        checkCacheSize()
      }, 1000)
    }
  }, [checkCacheSize])

  useEffect(() => {
    checkCacheSize()
  }, [checkCacheSize])

  return {
    cacheStatus,
    checkCacheSize,
    clearAllCaches,
  }
}

// =====================================================
// PWA Status Hook (Combined)
// =====================================================

export function usePWAStatus(): PWAStatus {
  const { isUpdateAvailable } = useServiceWorker()
  const isOnline = useOnlineStatus()
  const { canInstall, isInstalled } = useInstallPrompt()

  return {
    isInstalled,
    isOnline,
    isUpdateAvailable,
    canInstall,
  }
}

// =====================================================
// Utility Functions
// =====================================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ABRInsightsDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains('offlineQuizAttempts')) {
        db.createObjectStore('offlineQuizAttempts', { keyPath: 'id', autoIncrement: true })
      }

      if (!db.objectStoreNames.contains('offlineProgress')) {
        db.createObjectStore('offlineProgress', { keyPath: 'id', autoIncrement: true })
      }

      if (!db.objectStoreNames.contains('downloadedCourses')) {
        db.createObjectStore('downloadedCourses', { keyPath: 'courseId' })
      }
    }
  })
}

function getAllFromStore(db: IDBDatabase, storeName: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// =====================================================
// Offline Queue for API Requests
// =====================================================

export class OfflineQueue {
  private static instance: OfflineQueue
  private queue: Array<{ url: string; options: RequestInit; timestamp: number }> = []

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue()
    }
    return OfflineQueue.instance
  }

  async add(url: string, options: RequestInit): Promise<void> {
    this.queue.push({
      url,
      options,
      timestamp: Date.now(),
    })

    // Try to save to IndexedDB
    try {
      const db = await openDB()
      const transaction = db.transaction(['offlineProgress'], 'readwrite')
      const store = transaction.objectStore('offlineProgress')

      await new Promise((resolve, reject) => {
        const request = store.add({
          url,
          options,
          timestamp: Date.now(),
        })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('[PWA] Failed to save to offline queue:', error)
    }
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine) return

    const toProcess = [...this.queue]
    this.queue = []

    for (const item of toProcess) {
      try {
        await fetch(item.url, item.options)
        logger.info('[PWA] Processed offline request', { url: item.url })
      } catch (error) {
        logger.error('[PWA] Failed to process offline request', error, { url: item.url })
        this.queue.push(item) // Re-add on failure
      }
    }
  }
}

// Initialize offline queue processing when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    OfflineQueue.getInstance().processQueue()
  })
}
