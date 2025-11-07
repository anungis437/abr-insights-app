'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { navigationConfig } from '@/lib/navigation/navigationConfig'
import NavDropdown from './NavDropdown'

export default function PublicNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { public: publicLinks } = navigationConfig

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-xl font-bold text-white">ABR</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ABR Insights</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {publicLinks.map((link) => 
              link.children ? (
                <NavDropdown key={link.label} link={link} />
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get Started
            </Link>
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
              {publicLinks.map((link) =>
                link.children ? (
                  <NavDropdown key={link.label} link={link} isMobile />
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
