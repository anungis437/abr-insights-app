import { BookOpen, Clock, Users, Star, Filter, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Courses | ABR Insights - Expert-Led Anti-Racism Education',
  description: 'Access 50+ expert-led courses on anti-Black racism, workplace equity, and inclusive leadership. Designed by legal experts and EDI professionals.',
  keywords: ['anti-racism training', 'diversity courses', 'EDI certification', 'implicit bias training', 'inclusive leadership', 'workplace equity courses'],
  openGraph: {
    title: 'Expert Training Courses | ABR Insights',
    description: 'Build expertise in anti-Black racism through comprehensive courses designed by legal experts and EDI professionals.',
    type: 'website',
    url: 'https://abrinsights.ca/courses',
    siteName: 'ABR Insights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABR Insights Training Courses',
    description: '50+ expert-led courses on workplace equity and anti-racism.',
  },
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Expert-Led Training Courses
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Build your expertise in anti-Black racism through comprehensive courses designed by legal experts and EDI professionals
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-blue-100">
                <BookOpen className="h-5 w-5" />
                <span>50+ Courses</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Users className="h-5 w-5" />
                <span>15,000+ Learners</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5" />
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="card mx-auto -mt-16 max-w-5xl">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700">
                  Search Courses
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by title, topic, or keyword..."
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select id="category" className="input-field w-full">
                  <option value="">All Categories</option>
                  <option value="legal">Legal Foundations</option>
                  <option value="workplace">Workplace Equity</option>
                  <option value="education">Education</option>
                  <option value="health">Healthcare</option>
                  <option value="leadership">Leadership</option>
                  <option value="advocacy">Advocacy</option>
                </select>
              </div>
              <div>
                <label htmlFor="level" className="mb-2 block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select id="level" className="input-field w-full">
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                <strong>48 courses</strong> match your criteria
              </p>
              <button className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="px-4 py-12">
        <div className="container-custom">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Featured Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CourseCard
              title="Understanding Anti-Black Racism in Canada"
              category="Legal Foundations"
              level="Beginner"
              duration="2 hours"
              lessons={8}
              enrolled={2847}
              rating={4.9}
              price="Free"
              description="Comprehensive introduction to the history, impact, and legal frameworks addressing anti-Black racism in Canadian institutions."
              tier="free"
            />
            <CourseCard
              title="Building Inclusive Workplaces"
              category="Workplace Equity"
              level="Intermediate"
              duration="4 hours"
              lessons={12}
              enrolled={1653}
              rating={4.8}
              price="Professional"
              description="Learn evidence-based strategies to identify and eliminate systemic barriers in hiring, promotion, and workplace culture."
              tier="professional"
            />
            <CourseCard
              title="Legal Analysis of Tribunal Decisions"
              category="Legal Foundations"
              level="Advanced"
              duration="6 hours"
              lessons={15}
              enrolled={892}
              rating={4.9}
              price="Professional"
              description="Deep dive into landmark tribunal cases with AI-powered analysis tools to understand legal reasoning and precedents."
              tier="professional"
            />
            <CourseCard
              title="Microaggressions: Recognition & Response"
              category="Workplace Equity"
              level="Beginner"
              duration="90 minutes"
              lessons={6}
              enrolled={3214}
              rating={4.7}
              price="Free"
              description="Identify common microaggressions faced by Black professionals and learn effective intervention strategies."
              tier="free"
            />
            <CourseCard
              title="EDI Leadership Certification"
              category="Leadership"
              level="Advanced"
              duration="12 hours"
              lessons={24}
              enrolled={476}
              rating={5.0}
              price="Enterprise"
              description="Comprehensive certification program for senior leaders driving organizational change in equity, diversity, and inclusion."
              tier="enterprise"
            />
            <CourseCard
              title="Data-Driven Equity Audits"
              category="Leadership"
              level="Intermediate"
              duration="3 hours"
              lessons={10}
              enrolled={1124}
              rating={4.8}
              price="Professional"
              description="Master the tools and frameworks for conducting thorough equity audits using data analytics and AI insights."
              tier="professional"
            />
          </div>
        </div>
      </section>

      {/* All Courses by Category */}
      <section className="bg-white px-4 py-12">
        <div className="container-custom">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">Browse by Category</h2>
          
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Legal Foundations</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CompactCourseCard
                title="Canadian Human Rights Law Overview"
                duration="2.5 hours"
                level="Beginner"
                tier="free"
              />
              <CompactCourseCard
                title="Ontario Human Rights Code Deep Dive"
                duration="3 hours"
                level="Intermediate"
                tier="professional"
              />
              <CompactCourseCard
                title="Employment Equity Act Compliance"
                duration="2 hours"
                level="Intermediate"
                tier="professional"
              />
              <CompactCourseCard
                title="Disability Rights & Intersectionality"
                duration="2.5 hours"
                level="Intermediate"
                tier="professional"
              />
            </div>
          </div>

          <div className="mb-12">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Workplace Equity</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CompactCourseCard
                title="Inclusive Hiring Practices"
                duration="3 hours"
                level="Beginner"
                tier="free"
              />
              <CompactCourseCard
                title="Addressing Systemic Barriers"
                duration="4 hours"
                level="Intermediate"
                tier="professional"
              />
              <CompactCourseCard
                title="Performance Management Without Bias"
                duration="2.5 hours"
                level="Intermediate"
                tier="professional"
              />
              <CompactCourseCard
                title="Creating Psychologically Safe Teams"
                duration="3 hours"
                level="Beginner"
                tier="free"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Leadership & Strategy</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CompactCourseCard
                title="Executive EDI Strategy Development"
                duration="5 hours"
                level="Advanced"
                tier="enterprise"
              />
              <CompactCourseCard
                title="Change Management for Equity"
                duration="4 hours"
                level="Advanced"
                tier="professional"
              />
              <CompactCourseCard
                title="Board-Level EDI Governance"
                duration="3 hours"
                level="Advanced"
                tier="enterprise"
              />
              <CompactCourseCard
                title="Measuring EDI Impact & ROI"
                duration="3.5 hours"
                level="Intermediate"
                tier="professional"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Get access to our complete course library with a Professional plan
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-secondary bg-white text-primary-600 hover:bg-gray-50">
              View Pricing
            </button>
            <button className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-primary-600">
              Contact Sales
            </button>
          </div>
        </div>
      </section>    </div>
  )
}

function CourseCard({
  title,
  category,
  level,
  duration,
  lessons,
  enrolled,
  rating,
  price,
  description,
  tier
}: {
  title: string
  category: string
  level: string
  duration: string
  lessons: number
  enrolled: number
  rating: number
  price: string
  description: string
  tier: 'free' | 'professional' | 'enterprise'
}) {
  return (
    <div className="card group cursor-pointer transition-all hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {category}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          tier === 'free' 
            ? 'bg-green-100 text-green-700' 
            : tier === 'professional'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {price}
        </span>
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600">
        {title}
      </h3>
      
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span>{lessons} lessons</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{enrolled.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">{rating}</span>
          <span className="text-sm text-gray-500">({enrolled})</span>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {level}
        </span>
      </div>
    </div>
  )
}

function CompactCourseCard({
  title,
  duration,
  level,
  tier
}: {
  title: string
  duration: string
  level: string
  tier: 'free' | 'professional' | 'enterprise'
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-md">
      <div className="flex-1">
        <h4 className="mb-1 font-semibold text-gray-900 hover:text-primary-600">{title}</h4>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{level}</span>
        </div>
      </div>
      <span className={`ml-4 rounded-full px-3 py-1 text-xs font-semibold ${
        tier === 'free' 
          ? 'bg-green-100 text-green-700' 
          : tier === 'professional'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-purple-100 text-purple-700'
      }`}>
        {tier === 'free' ? 'Free' : tier === 'professional' ? 'Pro' : 'Enterprise'}
      </span>
    </div>
  )
}
