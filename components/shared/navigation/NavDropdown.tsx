'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { NavLink } from '@/lib/navigation/navigationConfig'

type NavDropdownProps = {
  link: NavLink
  isMobile?: boolean
}

export default function NavDropdown({ link, isMobile = false }: NavDropdownProps) {
  const [open, setOpen] = useState(false)

  if (!link.children || link.children.length === 0) {
    return null
  }

  if (isMobile) {
    // Mobile: Accordion style
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between py-2 text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          aria-expanded={open}
          aria-label={link.description || `Open ${link.label} menu`}
        >
          <span className="flex items-center gap-2">
            {link.icon && <link.icon className="h-5 w-5" />}
            {link.label}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="ml-4 flex flex-col gap-2 border-l-2 border-gray-200 pl-4 py-2">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="flex items-center gap-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
              >
                {child.icon && <child.icon className="h-4 w-4" />}
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Desktop: Hover dropdown
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={link.description || `Open ${link.label} menu`}
      >
        {link.icon && <link.icon className="h-4 w-4" />}
        {link.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div 
          className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg"
          onMouseEnter={() => setOpen(true)}
        >
          <div className="py-2">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600"
              >
                {child.icon && <child.icon className="h-4 w-4 text-gray-500" />}
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
