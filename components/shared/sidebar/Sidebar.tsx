'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Home, X, Menu, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarNavItem = {
  label: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
  children?: SidebarNavItem[]
  description?: string
}

type SidebarProps = {
  items: SidebarNavItem[]
  role?: string | null
}

const COLLAPSED_STATE_KEY = 'sidebar-collapsed-sections'

export default function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const saved = localStorage.getItem(COLLAPSED_STATE_KEY)
    if (saved) {
      try {
        return new Set(JSON.parse(saved))
      } catch (e) {
        logger.error('Failed to parse collapsed state:', { error: e, context: 'Sidebar' })
        return new Set()
      }
    }
    return new Set()
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Save collapsed state to localStorage
  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(label)) {
        newSet.delete(label)
      } else {
        newSet.add(label)
      }
      localStorage.setItem(COLLAPSED_STATE_KEY, JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }

  const isActive = (href?: string) => {
    if (!href || href === '#') return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasActiveChild = (item: SidebarNavItem): boolean => {
    if (isActive(item.href)) return true
    if (item.children) {
      return item.children.some((child) => hasActiveChild(child))
    }
    return false
  }

  const renderNavItem = (item: SidebarNavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isCollapsed = collapsedSections.has(item.label)
    const active = isActive(item.href)
    const childActive = hasActiveChild(item)
    const Icon = item.icon

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              level === 0 ? 'text-gray-900 hover:bg-gray-100' : 'text-gray-700 hover:bg-gray-50',
              childActive && 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            )}
            style={{ ['--indent-level' as string]: level } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                  {item.badge}
                </span>
              )}
            </div>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
          {!isCollapsed && (
            <div className="ml-0 mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'text-gray-700 hover:bg-gray-100',
          level > 0 && !active && 'text-gray-600'
        )}
        style={{ ['--indent-level' as string]: level } as React.CSSProperties}
      >
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              active ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-sm font-bold text-white">ABR</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">ABR Insights</div>
              {role && (
                <div className="text-xs text-gray-500">
                  {role
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">{items.map((item) => renderNavItem(item))}</div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500">Â© 2026 ABR Insights</div>
          </div>
        </div>
      </aside>
    </>
  )
}
