'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Clock, BookOpen, BarChart, Award, CheckCircle, PlayCircle, ArrowRight } from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  level: string | null
  estimated_duration_minutes: number | null
  is_published: boolean
  thumbnail_url: string | null
  category_id: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return

      try {
        setLoading(true)

        // Fetch course by slug
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single()

        if (courseError) {
          console.error('Error fetching course:', courseError)
          setError('Course not found')
          setLoading(false)
          return
        }

        setCourse(courseData)

        // Fetch category if course has one
        if (courseData.category_id) {
          const { data: categoryData } = await supabase
            .from('content_categories')
            .select('id, name, slug')
            .eq('id', courseData.category_id)
            .single()

          if (categoryData) {
            setCategory(categoryData)
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An error occurred while loading the course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [slug, supabase])

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'Not specified'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl py-20 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Course Not Found</h1>
            <p className="mb-8 text-gray-600">
              {error ||
                'The course you&apos;re looking for doesn&apos;t exist or has been removed.'}
            </p>
            <Link href="/courses" className="btn-primary inline-flex items-center gap-2">
              <ArrowRight className="h-5 w-5 rotate-180" />
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-12 text-white">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm text-primary-100">
              <Link href="/courses" className="hover:text-white">
                Courses
              </Link>
              <span>/</span>
              {category && (
                <>
                  <span>{category.name}</span>
                  <span>/</span>
                </>
              )}
              <span className="text-white">{course.title}</span>
            </div>

            {/* Course Header */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {category && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                  {category.name}
                </span>
              )}
              {course.level && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium capitalize">
                  {course.level}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold md:text-4xl">{course.title}</h1>

            {course.description && (
              <p className="mb-6 text-lg text-primary-50">{course.description}</p>
            )}

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatDuration(course.estimated_duration_minutes)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Self-paced learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>Certificate upon completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">About This Course</h2>
                <div className="prose max-w-none">
                  {course.description ? (
                    <p className="leading-relaxed text-gray-700">{course.description}</p>
                  ) : (
                    <p className="text-gray-600">
                      No detailed description available for this course.
                    </p>
                  )}
                </div>
              </div>

              <div className="card">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">What You&apos;ll Learn</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Understanding key concepts and principles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">
                      Practical application in workplace scenarios
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">
                      Evidence-based strategies and best practices
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">Tools and resources for ongoing learning</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Course Details</h3>

                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(course.estimated_duration_minutes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium capitalize text-gray-900">
                      {course.level || 'All levels'}
                    </span>
                  </div>
                  {category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium text-gray-900">Online</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/courses/${course.slug}/player`)}
                  className="btn-primary flex w-full items-center justify-center gap-2"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Course
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Sign in to track your progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Courses */}
          <div className="mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              Back to all courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
