'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook to detect if the viewport is mobile size
 * @param breakpoint - The width threshold in pixels (default: 768px)
 * @returns boolean indicating if viewport is below the breakpoint
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return

    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Set initial value
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}
