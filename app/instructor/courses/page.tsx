'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InstructorCoursesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin courses page
    router.push('/admin/courses')
  }, [router])

  return null
}
