'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { getNavigationForRole } from '@/lib/navigation/navigationConfig'
import type { UserRole } from '@/lib/navigation/navigationConfig'
import NavDropdown from './NavDropdown'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

export default function AuthenticatedNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const role = (profile?.role as UserRole) || 'learner'
  const navigationLinks = getNavigationForRole(role)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Links to dashboard for authenticated users */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-xl font-bold text-white">ABR</span>
            </div>
            <span className="hidden text-xl font-semibold text-gray-900 sm:inline">ABR Insights</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {navigationLinks.map((link) =>
              link.children ? (
                <NavDropdown key={link.label} link={link} />
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop Right Side: Notifications + User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            <NotificationBell />
            <UserMenu
              user={user!}
              profile={profile}
              onSignOut={signOut}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container-custom py-4">
            <div className="flex flex-col gap-2">
              {/* Navigation Links */}
              {navigationLinks.map((link) =>
                link.children ? (
                  <NavDropdown key={link.label} link={link} isMobile />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                  >
                    {link.icon && <link.icon className="h-5 w-5" />}
                    {link.label}
                  </Link>
                )
              )}

              {/* Notifications */}
              <div className="mt-2 border-t border-gray-200 pt-2">
                <NotificationBell isMobile />
              </div>

              {/* User Menu */}
              <UserMenu
                user={user!}
                profile={profile}
                onSignOut={() => {
                  setMobileMenuOpen(false)
                  signOut()
                }}
                isMobile
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
