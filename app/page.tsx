import Link from 'next/link'
import { BookOpen, Scale, Users, TrendingUp, ArrowRight } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
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
          <div className="grid gap-8 md:grid-cols-3">
            <StatCard number="10,000+" label="Tribunal Cases Indexed" />
            <StatCard number="50+" label="Expert-Led Courses" />
            <StatCard number="500+" label="Organizations Trained" />
          </div>
        </div>
      </section>

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
      </section>

      <Footer />
    </div>
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

      <Footer />
