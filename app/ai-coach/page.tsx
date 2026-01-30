import {
  GraduationCap,
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Brain,
  Clock,
  Users,
  BarChart3,
  Lightbulb,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function AICoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-green-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <GraduationCap className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Personalized AI Learning Coach
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Accelerate your anti-racism education with AI-powered recommendations, progress
              tracking, and personalized learning paths
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                <Target className="mr-2 h-5 w-5" />
                Start Learning Journey
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                View Plans
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
                <div className="mb-2 text-4xl font-bold text-primary-600">3x</div>
                <div className="text-sm text-gray-600">Faster Learning</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600">Course Completion</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600">Courses Available</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Smart Learning Features</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              AI-powered coaching that adapts to your learning style and organizational goals
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-primary-600" />}
              title="Personalized Learning Paths"
              description="AI analyzes your role, goals, and progress to recommend the perfect course sequence"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-primary-600" />}
              title="Progress Analytics"
              description="Track your learning journey with detailed insights and achievement milestones"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-primary-600" />}
              title="Skill Gap Analysis"
              description="Identify knowledge gaps and get targeted recommendations to fill them"
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-primary-600" />}
              title="Smart Reminders"
              description="AI-powered nudges keep you on track without overwhelming your schedule"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary-600" />}
              title="Team Benchmarking"
              description="Compare your progress with team averages and organizational goals"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-primary-600" />}
              title="Certification Tracking"
              description="Manage continuing education credits and track certification requirements"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Your AI Coaching Journey</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Four steps to accelerated learning and professional growth
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-4">
              <StepCard
                number="1"
                title="Set Your Goals"
                description="Tell the AI about your role, learning objectives, and time availability"
              />
              <StepCard
                number="2"
                title="Get Your Plan"
                description="Receive a personalized learning path with curated courses and resources"
              />
              <StepCard
                number="3"
                title="Learn & Track"
                description="Complete courses with real-time feedback and progress monitoring"
              />
              <StepCard
                number="4"
                title="Achieve & Grow"
                description="Earn certifications and unlock advanced content as you progress"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Learning Scenarios */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Tailored for Your Role</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              AI Coach adapts to your specific needs and organizational context
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <ScenarioCard
              title="HR Professionals"
              description="Get course recommendations focused on policy development, complaint handling, and compliance. AI tracks your CE credits automatically."
              icon={<Users className="h-10 w-10 text-primary-600" />}
            />
            <ScenarioCard
              title="Managers & Leaders"
              description="Build skills in inclusive hiring, team management, and bias interruption. Progress aligned with leadership development goals."
              icon={<Target className="h-10 w-10 text-primary-600" />}
            />
            <ScenarioCard
              title="Frontline Employees"
              description="Foundation courses on recognizing discrimination, allyship, and workplace respect. Bite-sized learning fits your schedule."
              icon={<CheckCircle className="h-10 w-10 text-primary-600" />}
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-br from-primary-50 to-green-50 px-4 py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Why Learners Love AI Coach
            </h2>

            <div className="space-y-6">
              <BenefitItem
                icon={<Zap className="h-6 w-6" />}
                title="Learn 3x Faster"
                description="Personalized paths eliminate time wasted on irrelevant content"
              />
              <BenefitItem
                icon={<Brain className="h-6 w-6" />}
                title="Never Lose Momentum"
                description="Smart reminders and bite-sized lessons keep you progressing consistently"
              />
              <BenefitItem
                icon={<BarChart3 className="h-6 w-6" />}
                title="See Your Impact"
                description="Visualize how your learning translates to workplace improvements"
              />
              <BenefitItem
                icon={<Award className="h-6 w-6" />}
                title="Earn Recognition"
                description="Build a portfolio of certifications and demonstrate expertise"
              />
              <BenefitItem
                icon={<Target className="h-6 w-6" />}
                title="Stay Accountable"
                description="Set goals, track progress, and celebrate achievements with your team"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="card mx-auto max-w-3xl bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600">
                T
              </div>
            </div>
            <blockquote className="mb-6 text-center text-xl leading-relaxed text-gray-700">
              &ldquo;The AI Coach helped our team complete 50+ courses in 3 months. The personalized
              recommendations meant everyone learned what they actually needed, not generic
              content.&rdquo;
            </blockquote>
            <div className="text-center">
              <div className="font-semibold text-gray-900">Taylor Chen</div>
              <div className="text-sm text-gray-600">
                Learning & Development Director, Tech Corp
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="card mx-auto max-w-4xl bg-gradient-to-r from-primary-600 to-green-600 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Start Your Learning Journey Today</h2>
            <p className="mb-8 text-xl text-blue-100">
              Join thousands of professionals building anti-racism expertise with AI-powered
              coaching
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card group transition-all hover:shadow-xl">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="relative text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-green-600 text-2xl font-bold text-white">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ScenarioCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="card group transition-all hover:shadow-xl">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex-shrink-0 rounded-lg bg-primary-100 p-3 text-primary-600">{icon}</div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
