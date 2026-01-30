import {
  Sparkles,
  MessageSquare,
  Search,
  BookOpen,
  Zap,
  CheckCircle,
  ArrowRight,
  Brain,
  Clock,
  Target,
  Shield,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-purple-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <Sparkles className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              AI-Powered Anti-Racism Assistant
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Get instant answers about case law, policies, and best practices with advanced AI
              trained on 10,000+ tribunal decisions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/login"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Try AI Assistant
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
                <div className="mb-2 text-4xl font-bold text-primary-600">24/7</div>
                <div className="text-sm text-gray-600">Always Available</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">&lt;5s</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-gray-600">Cases Analyzed</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">98%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Powerful AI Capabilities</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Advanced AI technology trained specifically on anti-Black racism case law and best
              practices
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-8 w-8 text-primary-600" />}
              title="Intelligent Case Search"
              description="Ask questions in natural language and get precise answers from our comprehensive case database"
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-primary-600" />}
              title="Contextual Understanding"
              description="AI understands nuances and context of anti-Black racism issues for accurate, relevant responses"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary-600" />}
              title="Instant Insights"
              description="Get immediate analysis of tribunal decisions, policy implications, and recommended actions"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-primary-600" />}
              title="Policy Guidance"
              description="Receive expert guidance on creating and implementing effective anti-racism policies"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Compliance Support"
              description="Ensure your organization meets legal requirements with AI-powered compliance checking"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-primary-600" />}
              title="Trend Analysis"
              description="Identify emerging patterns and trends in tribunal decisions and workplace issues"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Three simple steps to get expert AI assistance
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="1"
                title="Ask Your Question"
                description="Type your question in natural language - no special syntax required"
              />
              <StepCard
                number="2"
                title="AI Analysis"
                description="Advanced AI searches 10,000+ cases and provides contextual analysis"
              />
              <StepCard
                number="3"
                title="Get Insights"
                description="Receive detailed answers with case citations and actionable recommendations"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Real-World Applications</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              See how organizations use AI Assistant to build equitable workplaces
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <UseCaseCard
              title="HR Policy Review"
              description="Quickly assess whether your hiring policies align with anti-discrimination requirements by asking the AI to analyze them against tribunal precedents."
              icon={<Target className="h-10 w-10 text-primary-600" />}
            />
            <UseCaseCard
              title="Incident Response"
              description="Get immediate guidance on how to handle workplace discrimination complaints based on similar cases and established best practices."
              icon={<Shield className="h-10 w-10 text-primary-600" />}
            />
            <UseCaseCard
              title="Training Development"
              description="Create evidence-based training content by asking the AI about common issues, effective interventions, and real case outcomes."
              icon={<Target className="h-10 w-10 text-primary-600" />}
            />
            <UseCaseCard
              title="Compliance Audits"
              description="Verify your organization's practices meet legal standards by querying tribunal decisions and regulatory requirements."
              icon={<CheckCircle className="h-10 w-10 text-primary-600" />}
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-br from-primary-50 to-purple-50 px-4 py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Why Teams Choose AI Assistant
            </h2>

            <div className="space-y-6">
              <BenefitItem
                icon={<Clock className="h-6 w-6" />}
                title="Save Hours of Research"
                description="Get instant answers instead of spending hours searching through case law manually"
              />
              <BenefitItem
                icon={<Brain className="h-6 w-6" />}
                title="Expert-Level Accuracy"
                description="AI trained on verified tribunal decisions and legal precedents ensures reliable guidance"
              />
              <BenefitItem
                icon={<Zap className="h-6 w-6" />}
                title="Always Up-to-Date"
                description="Continuous learning from new cases means you always have the latest insights"
              />
              <BenefitItem
                icon={<Shield className="h-6 w-6" />}
                title="Reduce Legal Risk"
                description="Make informed decisions backed by case law and reduce organizational exposure"
              />
              <BenefitItem
                icon={<Target className="h-6 w-6" />}
                title="Actionable Recommendations"
                description="Get specific steps and best practices, not just general information"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="container-custom">
          <div className="card mx-auto max-w-4xl bg-gradient-to-r from-primary-600 to-purple-600 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Workflow?</h2>
            <p className="mb-8 text-xl text-blue-100">
              Join thousands of HR professionals using AI Assistant to build equitable workplaces
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Start Free Trial
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-purple-600 text-2xl font-bold text-white">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function UseCaseCard({
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
