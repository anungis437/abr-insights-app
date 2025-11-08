'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  href?: string
}

type NotificationBellProps = {
  isMobile?: boolean
}

export default function NotificationBell({ isMobile = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  
  // Mock notifications - will be replaced with real data later
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New course assigned',
      message: 'Ethics 101 has been assigned to you',
      time: '2 hours ago',
      read: false,
      href: '/training'
    },
    {
      id: '2',
      title: 'Achievement unlocked',
      message: 'You earned the "Case Explorer" badge!',
      time: '1 day ago',
      read: false,
      href: '/achievements'
    },
    {
      id: '3',
      title: 'Report ready',
      message: 'Your Q4 analysis report is complete',
      time: '2 days ago',
      read: true,
      href: '/analytics'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  if (isMobile) {
    // Mobile: Link to notifications page
    return (
      <Link
        href="/notifications"
        className="flex items-center justify-between py-2 text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
      >
        <span className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </span>
        {unreadCount > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  // Desktop: Dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href || '#'}
                    className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-2">
            <Link
              href="/notifications"
              className="block rounded px-4 py-2 text-center text-sm font-medium text-primary-600 transition-colors hover:bg-gray-50"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
