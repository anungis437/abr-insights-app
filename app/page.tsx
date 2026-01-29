'use client';

import Link from 'next/link'
import { BookOpen, Scale, Users, TrendingUp, ArrowRight, Clock, Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import Testimonials from '@/components/shared/Testimonials'
import { tribunalCasesService, coursesService, getFeaturedTestimonials } from '@/lib/supabase/services'
import type { Course, Testimonial } from '@/lib/supabase/services'

export default function HomePage() {
  const [stats, setStats] = useState({ 
    totalCases: 0, 
    abrCases: 0,
    totalCourses: 0,
    loading: true 
  });
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function fetchData() {
      // TODO: Run database migrations first - see docs/SUPABASE_SETUP.md
      // For now, using fallback data until migrations are applied
      try {
        // Fetch tribunal case stats
        const caseStats = await tribunalCasesService.getStats();
        
        setStats({
          totalCases: caseStats?.total_cases || 0,
          abrCases: caseStats?.abr_cases || 0,
          totalCourses: caseStats?.total_courses || 0,
          loading: false,
        });
      } catch (err) {
        console.error('Failed to fetch case stats (database not initialized):', err);
        // Use fallback stats until database is initialized
        setStats({
          totalCases: 0,
          abrCases: 0,
          totalCourses: 0,
          loading: false,
        });
      }

      // Fetch courses independently to prevent one failure from affecting others
      try {
        const { data: courses } = await coursesService.list(
          { is_published: true },
          { limit: 3 }
        );
        
        if (courses) {
          setFeaturedCourses(courses);
        }
      } catch (err) {
        console.error('Failed to fetch featured courses:', err);
      }

      // Fetch testimonials independently
      try {
        const testimonialsData = await getFeaturedTestimonials(3);
        setTestimonials(testimonialsData || []);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
        // Testimonials table might not exist yet, fail gracefully
        setTestimonials([]);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
                Transform Your Understanding of{' '}
                <span className="text-yellow-300">Anti-Black Racism</span>
              </h1>
              <p className="mb-8 text-xl text-gray-100 md:text-2xl">
                Comprehensive training, real-world case studies, and actionable insights for creating truly equitable workplaces
              </p>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-start">
                <Link href="/auth/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/about" className="btn-secondary border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Hero Image/Illustration */}
            <div className="hidden lg:block">
              <div className="relative h-96 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-2xl"></div>
                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-blue-300 to-blue-500 shadow-2xl"></div>
                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-purple-300 to-purple-500 shadow-2xl"></div>
                    <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-green-300 to-green-500 shadow-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Everything You Need to Build Equity
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Comprehensive tools and resources designed for organizations committed to meaningful change
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Expert Training"
              description="Interactive courses designed by anti-racism experts with real-world applications"
              href="/courses"
            />
            <FeatureCard
              icon={<Scale className="h-8 w-8" />}
              title="Case Law Explorer"
              description="AI-powered search through thousands of tribunal decisions with smart insights"
              href="/cases"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Collaboration"
              description="Track progress, share resources, and build accountability across your organization"
              href="/team"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Progress Analytics"
              description="Measure impact with comprehensive analytics and actionable reporting"
              href="/analytics"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-4">
            <StatCard 
              number={stats.loading ? '...' : stats.totalCases.toLocaleString()} 
              label="Tribunal Cases Analyzed" 
            />
            <StatCard 
              number={stats.loading ? '...' : stats.abrCases.toLocaleString()} 
              label="ABR Cases Identified" 
            />
            <StatCard 
              number={stats.loading ? '...' : stats.totalCourses.toLocaleString()} 
              label="Interactive Courses" 
            />
            <StatCard 
              number="100%" 
              label="AI-Enhanced Classification" 
            />
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20">
          <div className="container-custom">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Featured Training Courses
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                Start your anti-racism journey with our expert-designed courses
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/courses" className="btn-primary">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <Testimonials testimonials={testimonials} />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-12 text-center text-white shadow-2xl">
            <h2 className="mb-4 text-4xl font-bold">
              Ready to Create Real Change?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl">
              Join hundreds of organizations building more equitable workplaces with ABR Insights
            </p>
            <Link href="/auth/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="group card">
      <div className="mb-4 text-primary-600">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-primary-600">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-4xl font-bold text-primary-600">{number}</div>
      <div className="text-lg text-gray-600">{label}</div>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const levelColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
  }[course.level] || 'bg-gray-100 text-gray-800';

  return (
    <Link href={`/courses/${course.slug}`} className="group card hover:shadow-xl transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${levelColor}`}>
          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
        </span>
        {course.estimated_duration_minutes && (
          <span className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            {course.estimated_duration_minutes} min
          </span>
        )}
      </div>
      
      <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-primary-600">
        {course.title}
      </h3>
      
      {course.description && (
        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
          {course.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center">
          <BookOpen className="mr-1 h-4 w-4" />
          {course.total_lessons || 0} lessons
        </span>
        <span className="text-primary-600 group-hover:underline">
          Start Learning →
        </span>
      </div>
    </Link>
  )
}
