import { BookOpen, Target, Users, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About ABR Insights | Empowering Equity Through Data',
  description: 'Learn about ABR Insights mission to combat anti-Black racism in Canadian workplaces through data-driven insights, expert training, and comprehensive case studies.',
  keywords: ['anti-Black racism', 'workplace equity', 'diversity training', 'HR analytics', 'Canadian tribunal cases', 'EDI consulting'],
  openGraph: {
    title: 'About ABR Insights | Empowering Equity Through Data',
    description: 'Discover how ABR Insights helps organizations build more equitable workplaces through expert analysis and actionable insights.',
    type: 'website',
    url: 'https://abrinsights.ca/about',
    siteName: 'ABR Insights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ABR Insights',
    description: 'Empowering organizations with data-driven insights to combat anti-Black racism.',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              About ABR Insights
            </h1>
            <p className="text-lg text-primary-50 md:text-xl">
              Empowering organizations with data-driven insights to combat anti-Black racism
              and build more equitable workplaces across Canada.
            </p>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 bottom-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="card border-l-4 border-l-primary-600">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary-100 p-3">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                To provide accessible, comprehensive resources and data analytics that enable
                organizations to understand, address, and prevent anti-Black racism in the
                workplace through evidence-based decision making and continuous learning.
              </p>
              {/* Mission Illustration */}
              <div className="mt-6 h-48 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200"></div>
            </div>

            <div className="card border-l-4 border-l-secondary-600">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-secondary-100 p-3">
                <Award className="h-8 w-8 text-secondary-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                A Canada where every workplace is free from anti-Black racism, where equity
                is not just a policy but a lived reality, and where data-driven insights
                empower leaders to create lasting systemic change.
              </p>
              {/* Vision Illustration */}
              <div className="mt-6 h-48 rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="relative bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">What We Do</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              ABR Insights combines cutting-edge AI technology with comprehensive legal data
              to provide actionable insights for organizations committed to equity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-primary-600" />}
              title="Educational Platform"
              description="Access over 50 curated courses covering anti-Black racism, workplace equity, legal compliance, and allyship practices."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary-600" />}
              title="Tribunal Case Database"
              description="Search and analyze 10,000+ Canadian tribunal cases with AI-powered classification and insights."
            />
            <FeatureCard
              icon={<Target className="h-10 w-10 text-primary-600" />}
              title="Analytics & Reporting"
              description="Track organizational progress, identify trends, and generate compliance reports with our advanced analytics tools."
            />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute left-1/3 bottom-1/3 h-72 w-72 rounded-full bg-secondary-600 blur-3xl" />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Impact</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Making a measurable difference in workplaces across Canada
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard number="500+" label="Organizations Served" />
            <StatCard number="10,000+" label="Tribunal Cases Analyzed" />
            <StatCard number="50+" label="Educational Courses" />
            <StatCard number="15,000+" label="Learners Trained" />
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute left-1/4 top-1/2 h-80 w-80 rounded-full bg-yellow-300 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
      </section>

      {/* Our Approach */}
      <section className="relative bg-primary-50 py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Approach</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <ApproachCard
              number="01"
              title="Data-Driven Insights"
              description="We leverage AI and machine learning to analyze tribunal cases, identify patterns, and provide actionable recommendations based on real legal precedents."
            />
            <ApproachCard
              number="02"
              title="Evidence-Based Learning"
              description="Our courses are developed by experts in employment law, human rights, and organizational development, grounded in the latest research and best practices."
            />
            <ApproachCard
              number="03"
              title="Continuous Improvement"
              description="We track progress over time, helping organizations measure impact, identify gaps, and continuously refine their equity strategies."
            />
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-primary-300 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-secondary-300 blur-3xl" />
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Values</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              title="Equity First"
              description="We center the experiences of Black Canadians in everything we do."
            />
            <ValueCard
              title="Evidence-Based"
              description="Our recommendations are grounded in data, research, and legal precedent."
            />
            <ValueCard
              title="Accessibility"
              description="Knowledge should be accessible to all organizations, regardless of size or budget."
            />
            <ValueCard
              title="Transparency"
              description="We believe in open, honest communication about challenges and progress."
            />
            <ValueCard
              title="Collaboration"
              description="Change requires collective effort from leaders, teams, and individuals."
            />
            <ValueCard
              title="Continuous Learning"
              description="The fight against racism is ongoing, and so is our commitment to learning."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mb-8 text-lg text-primary-50">
              Join hundreds of organizations using ABR Insights to build more equitable
              workplaces.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/auth/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Get Started Free
              </a>
              <a href="/contact" className="btn-secondary border-white text-white hover:bg-white/10">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>    </div>
  )
}

// Supporting Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-4xl font-bold text-primary-600 md:text-5xl">{number}</div>
      <div className="text-lg font-medium text-gray-600">{label}</div>
    </div>
  )
}

function ApproachCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="card relative">
      <div className="absolute right-4 top-4 text-6xl font-bold text-primary-100">{number}</div>
      <h3 className="relative z-10 mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="relative z-10 leading-relaxed text-gray-600">{description}</p>
    </div>
  )
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border-2 border-primary-200 bg-white p-6 transition-all hover:border-primary-400 hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
