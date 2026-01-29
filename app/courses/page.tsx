import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Clock,
  Target,
} from 'lucide-react'
import Link from 'next/link'

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <GraduationCap className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Expert-Led Anti-Black Racism Training
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Comprehensive courses designed by leading experts to build workplace equity and combat
              systemic racism
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Course Catalog
              </Link>
              <Link
                href="/auth/signup"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="card mx-auto -mt-16 max-w-5xl">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600">Expert-Led Courses</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">10,000+</div>
                <div className="text-sm text-gray-600">Learners Trained</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">4.8/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                What You&apos;ll Learn
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive training covering all aspects of anti-Black racism and workplace
                equity
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Understanding Systemic Racism
                </h3>
                <p className="text-gray-600">
                  Learn about the historical context and current manifestations of anti-Black racism
                  in Canadian institutions
                </p>
              </div>

              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Inclusive Leadership</h3>
                <p className="text-gray-600">
                  Develop skills to create equitable workplace cultures and lead diverse teams
                  effectively
                </p>
              </div>

              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Legal Frameworks</h3>
                <p className="text-gray-600">
                  Understand human rights legislation, tribunal decisions, and compliance
                  requirements
                </p>
              </div>

              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <CheckCircle className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Practical Strategies</h3>
                <p className="text-gray-600">
                  Implement evidence-based interventions to address bias and discrimination in
                  real-world scenarios
                </p>
              </div>

              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Self-Paced Learning</h3>
                <p className="text-gray-600">
                  Study at your own pace with flexible access to video lessons, case studies, and
                  interactive content
                </p>
              </div>

              <div className="card transition-shadow hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Professional Certification</h3>
                <p className="text-gray-600">
                  Earn certificates and continuing education credits recognized by professional
                  bodies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Course Categories
              </h2>
              <p className="text-xl text-gray-600">
                Explore our comprehensive curriculum across multiple focus areas
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary-500 hover:shadow-lg">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Foundational Training</h3>
                <p className="mb-4 text-gray-600">
                  Essential courses covering the basics of anti-Black racism, microaggressions, and
                  unconscious bias
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Introduction to Anti-Black Racism</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Understanding Unconscious Bias</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Microaggressions in the Workplace</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary-500 hover:shadow-lg">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Legal & Compliance</h3>
                <p className="mb-4 text-gray-600">
                  In-depth analysis of human rights law, tribunal cases, and organizational
                  obligations
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Canadian Human Rights Framework</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Tribunal Case Analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Employer Obligations & Liability</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary-500 hover:shadow-lg">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Leadership & Management</h3>
                <p className="mb-4 text-gray-600">
                  Advanced training for leaders creating inclusive workplace cultures and driving
                  change
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Inclusive Leadership Practices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Equity-Focused Hiring & Promotion</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Managing Difficult Conversations</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-primary-500 hover:shadow-lg">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Specialized Topics</h3>
                <p className="mb-4 text-gray-600">
                  Sector-specific training for law enforcement, healthcare, education, and public
                  service
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Police & Public Safety Training</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Healthcare Equity & Access</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Educational Institution Frameworks
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-12 text-center text-white shadow-2xl">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Learning?</h2>
            <p className="mb-8 text-xl text-blue-100">
              Join thousands of professionals building more equitable workplaces
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
