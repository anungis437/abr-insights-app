import { BookOpen, Calendar, User, ArrowRight, TrendingUp } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-16 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <BookOpen className="h-12 w-12" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              ABR Insights Blog
            </h1>
            <p className="text-xl text-blue-100">
              Expert insights on anti-Black racism, workplace equity, and legal developments
            </p>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 bottom-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto -mt-8 max-w-5xl">
            <div className="card">
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white">
                  All Posts
                </button>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Legal Updates
                </button>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Workplace Equity
                </button>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Case Analysis
                </button>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Best Practices
                </button>
                <button className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Research
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured Article</h2>
            <div className="card overflow-hidden md:flex">
              <div className="h-64 bg-gradient-to-br from-primary-600 to-secondary-600 md:w-2/5"></div>
              <div className="p-8 md:w-3/5">
                <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                    Legal Updates
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    November 1, 2025
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  Major Policy Changes at OHRT: What Organizations Need to Know
                </h3>
                <p className="mb-4 text-gray-700">
                  The Ontario Human Rights Tribunal has announced significant updates to its application 
                  procedures and mediation processes. Learn how these changes will affect your organization&apos;s 
                  approach to human rights complaints and what steps you should take now to prepare.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Dr. Sarah Johnson, Legal Director</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                    Read More <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Recent Posts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BlogCard
                title="Understanding Systemic Discrimination in Performance Reviews"
                category="Workplace Equity"
                date="October 28, 2025"
                author="Marcus Williams"
                excerpt="New research reveals how unconscious bias manifests in annual performance evaluations and practical steps to address it."
                readTime="8 min read"
              />
              
              <BlogCard
                title="Landmark Decision: Thompson v. City Services"
                category="Case Analysis"
                date="October 25, 2025"
                author="Dr. Jennifer Lee"
                excerpt="Analysis of this precedent-setting case on municipal employment practices and its implications for public sector organizations."
                readTime="12 min read"
              />
              
              <BlogCard
                title="Building Psychologically Safe Workplaces for Black Employees"
                category="Best Practices"
                date="October 22, 2025"
                author="Dr. Michael Brown"
                excerpt="Evidence-based strategies for creating environments where Black professionals can thrive without fear of microaggressions."
                readTime="10 min read"
              />
              
              <BlogCard
                title="2025 Workplace Discrimination Trends Report"
                category="Research"
                date="October 18, 2025"
                author="ABR Insights Research Team"
                excerpt="Our annual analysis of tribunal decisions reveals emerging patterns in discrimination cases across Canadian workplaces."
                readTime="15 min read"
              />
              
              <BlogCard
                title="Effective Response to Racial Harassment Complaints"
                category="Best Practices"
                date="October 15, 2025"
                author="Lisa Thompson"
                excerpt="A step-by-step guide for HR professionals on conducting trauma-informed investigations of racial harassment allegations."
                readTime="11 min read"
              />
              
              <BlogCard
                title="New Federal Employment Equity Regulations Explained"
                category="Legal Updates"
                date="October 10, 2025"
                author="Dr. Sarah Johnson"
                excerpt="Breaking down the amended Employment Equity Act and what federally regulated employers must do to comply."
                readTime="9 min read"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="bg-white px-4 py-12">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">In-Depth Case Studies</h2>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View All Case Studies →
              </button>
            </div>
            <div className="space-y-6">
              <CaseStudyCard
                title="How a Major Retailer Transformed Their Hiring Practices"
                company="Retail Chain Inc."
                results={['63% increase in Black applicants reaching interview stage', '47% reduction in bias-related complaints', 'Documented $2.1M cost avoidance from prevented litigation']}
                category="Hiring Equity"
              />
              
              <CaseStudyCard
                title="University's Journey to Inclusive Academic Policies"
                company="Metro University"
                results={['Eliminated 12 systemic barriers in student discipline', 'Created culturally responsive support programs', 'Zero discrimination findings in 3 years post-implementation']}
                category="Education"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Stay Informed</h2>
            <p className="mb-8 text-xl text-blue-100">
              Get monthly insights on anti-Black racism, legal updates, and workplace equity delivered to your inbox
            </p>
            <div className="mx-auto flex max-w-md gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1 bg-white"
              />
              <button className="btn-primary whitespace-nowrap border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-sm text-blue-100">
              Join 8,000+ professionals. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function BlogCard({
  title,
  category,
  date,
  author,
  excerpt,
  readTime
}: {
  title: string
  category: string
  date: string
  author: string
  excerpt: string
  readTime: string
}) {
  return (
    <div className="card group cursor-pointer transition-all hover:shadow-xl">
      <div className="mb-4 h-48 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600"></div>
      <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {category}
        </span>
        <span>{readTime}</span>
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary-600">
        {title}
      </h3>
      <p className="mb-4 text-sm text-gray-600">{excerpt}</p>
      <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}

function CaseStudyCard({
  title,
  company,
  results,
  category
}: {
  title: string
  company: string
  results: string[]
  category: string
}) {
  return (
    <div className="card border-l-4 border-l-primary-600">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {category}
        </span>
        <span className="text-sm text-gray-600">{company}</span>
      </div>
      <h3 className="mb-4 text-xl font-bold text-gray-900">{title}</h3>
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Key Results
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {results.map((result, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">✓</span>
              {result}
            </li>
          ))}
        </ul>
      </div>
      <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
        Read Full Case Study →
      </button>
    </div>
  )
}
