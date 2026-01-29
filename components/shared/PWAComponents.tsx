'use client'

import { useEffect, useState } from 'react'
import { useInstallPrompt, useOnlineStatus, useServiceWorker } from '@/lib/hooks/usePWA'
import { X, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('pwa-install-dismissed') === 'true'
  })

  useEffect(() => {
    if (dismissed) return

    // Show prompt after a delay if can install
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 10000) // Show after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (installed) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || dismissed || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up rounded-lg border border-gray-200 bg-white p-6 shadow-2xl md:left-auto md:right-4 md:w-96">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Download className="h-6 w-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-gray-900">Install ABR Insights</h3>
          <p className="mb-4 text-sm text-gray-600">
            Get faster access and work offline by installing our app
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PWAUpdateNotification() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker()
  const [showNotification, setShowNotification] = useState(isUpdateAvailable)

  if (!showNotification) return null

  return (
    <div className="fixed left-4 right-4 top-4 z-50 animate-slide-down rounded-lg bg-blue-600 p-4 text-white shadow-2xl md:left-auto md:right-4 md:w-96">
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 flex-shrink-0" />

        <div className="flex-1">
          <h3 className="mb-1 font-semibold">Update Available</h3>
          <p className="mb-3 text-sm text-blue-100">A new version is ready to install</p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                updateServiceWorker()
                setShowNotification(false)
              }}
              className="rounded bg-white px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowNotification(false)}
              className="rounded px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus()
  const [showIndicator, setShowIndicator] = useState(false)
  const [wasOffline, setWasOffline] = useState(!isOnline)

  useEffect(() => {
    // Schedule state update to avoid cascading renders
    const updateIndicator = async () => {
      if (!isOnline) {
        setShowIndicator(true)
      } else if (wasOffline) {
        // Show "back online" message briefly
        setShowIndicator(true)
        const timer = setTimeout(() => {
          setShowIndicator(false)
          setWasOffline(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }

    Promise.resolve().then(updateIndicator)
  }, [isOnline, wasOffline])

  if (!showIndicator) return null

  return (
    <div
      className={`fixed left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-full px-4 py-2 shadow-lg ${
        isOnline ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You&apos;re Offline</span>
        </>
      )}
    </div>
  )
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <OnlineStatusIndicator />
    </>
  )
}
