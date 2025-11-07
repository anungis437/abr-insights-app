'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { getUserMenuItems } from '@/lib/navigation/navigationConfig'
import type { Profile } from '@/lib/supabase'

type UserMenuProps = {
  user: {
    email?: string
    name?: string
  }
  profile: Profile | null
  onSignOut: () => void
  isMobile?: boolean
}

export default function UserMenu({ user, profile, onSignOut, isMobile = false }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuItems = getUserMenuItems()

  const displayName = profile?.display_name || 
    (profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : user.name || user.email)

  const roleLabel = profile?.role 
    ? profile.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'User'

  if (isMobile) {
    // Mobile: Expanded view at bottom of menu
    return (
      <div className="border-t border-gray-200 pt-4">
        <div className="mb-3 flex items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="truncate text-xs text-gray-500">{roleLabel}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Desktop: Dropdown menu
  return (
    <div 
      className="relative"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden text-left lg:block">
          <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">{displayName}</p>
          <p className="text-xs text-gray-500">{roleLabel}</p>
        </div>
      </button>

      {open && (
        <div 
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg"
          onMouseEnter={() => setOpen(true)}
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-primary-600">{roleLabel}</p>
          </div>
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
              >
                {item.icon && <item.icon className="h-4 w-4 text-gray-500" />}
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={onSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
