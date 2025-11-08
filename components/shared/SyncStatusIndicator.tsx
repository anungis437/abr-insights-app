'use client'

import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/lib/hooks/usePWA'

interface SyncStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  variant?: 'compact' | 'full'
}

interface PendingItem {
  id: string
  type: 'quiz' | 'progress' | 'achievement'
  timestamp: number
}

export default function SyncStatusIndicator({
  position = 'bottom-right',
  variant = 'compact',
}: SyncStatusIndicatorProps) {
  const isOnline = useOnlineStatus()
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadPendingItems()
    
    const interval = setInterval(loadPendingItems, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isOnline && pendingItems.length > 0) {
      handleSync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingItems.length])

  const loadPendingItems = async () => {
    try {
      const db = await openDB()
      const [quizAttempts, progressItems] = await Promise.all([
        getAllFromStore(db, 'offlineQuizAttempts'),
        getAllFromStore(db, 'offlineProgress'),
      ])

      const items: PendingItem[] = [
        ...quizAttempts.map((item: any) => ({
          id: item.id || String(Date.now()),
          type: 'quiz' as const,
          timestamp: item.timestamp || Date.now(),
        })),
        ...progressItems.map((item: any) => ({
          id: item.id || String(Date.now()),
          type: 'progress' as const,
          timestamp: item.timestamp || Date.now(),
        })),
      ]

      setPendingItems(items)
    } catch (error) {
      console.error('[SyncStatus] Failed to load pending items:', error)
    }
  }

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register('sync-quiz-attempts')
          await (registration as any).sync.register('sync-course-progress')
        }
        
        setTimeout(() => {
          setLastSyncTime(Date.now())
          loadPendingItems()
          setIsSyncing(false)
        }, 2000)
      }
    } catch (error) {
      console.error('[SyncStatus] Sync failed:', error)
      setIsSyncing(false)
    }
  }

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('abr-insights-pwa', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  const getAllFromStore = (db: IDBDatabase, storeName: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  const formatRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getTypeLabel = (type: string): string => {
    const labels = {
      quiz: 'Quiz Attempt',
      progress: 'Course Progress',
      achievement: 'Achievement',
    }
    return labels[type as keyof typeof labels] || type
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  }

  if (pendingItems.length === 0 && !showDetails) return null

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-sm">
        {/* Header */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              isSyncing ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Cloud className="w-5 h-5 text-green-600" />
              )
            ) : (
              <CloudOff className="w-5 h-5 text-gray-400" />
            )}
            <div className="text-left">
              <div className="font-medium text-gray-900 text-sm">
                {isSyncing ? 'Syncing...' : isOnline ? 'Synced' : 'Offline'}
              </div>
              {pendingItems.length > 0 && (
                <div className="text-xs text-gray-600">
                  {pendingItems.length} pending {pendingItems.length === 1 ? 'item' : 'items'}
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {pendingItems.length > 0 && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {pendingItems.length}
            </div>
          )}
        </button>

        {/* Details Panel */}
        {showDetails && variant === 'full' && (
          <div className="border-t border-gray-200">
            {pendingItems.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {getTypeLabel(item.type)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {formatRelativeTime(item.timestamp)}
                        </div>
                      </div>
                      {isOnline ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">All synced!</div>
                <div className="text-xs text-gray-600 mt-1">
                  {lastSyncTime && `Last sync: ${formatRelativeTime(lastSyncTime)}`}
                </div>
              </div>
            )}

            {/* Manual Sync Button */}
            {isOnline && pendingItems.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            )}

            {/* Offline Message */}
            {!isOnline && pendingItems.length > 0 && (
              <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    Changes will sync automatically when you&apos;re back online
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
