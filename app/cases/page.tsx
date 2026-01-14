import { Scale, BookOpen, Search, Database, TrendingUp, Users, CheckCircle, ArrowRight, FileText, Award, Shield } from 'lucide-react'
import Link from 'next/link'

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <Scale className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Comprehensive Case Law Database
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Access 10,000+ human rights tribunal decisions with AI-powered analysis and insights
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/login" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                <FileText className="mr-2 h-5 w-5" />
                Explore Case Database
              </Link>
              <Link href="/auth/signup" className="btn-secondary border-white text-white hover:bg-white/10">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute left-1/3 bottom-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="card mx-auto -mt-16 max-w-5xl">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">10,000+</div>
                <div className="text-sm text-gray-600">Tribunal Decisions</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">15+</div>
                <div className="text-sm text-gray-600">Years of Data</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">3</div>
                <div className="text-sm text-gray-600">Major Tribunals</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary-600">100%</div>
                <div className="text-sm text-gray-600">Searchable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Powerful Case Research Tools
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to research, analyze, and learn from human rights case law
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Search className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Advanced Search</h3>
                <p className="text-gray-600">
                  Powerful search across case names, decisions, citations, and full text with advanced filtering options
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Database className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Comprehensive Coverage</h3>
                <p className="text-gray-600">
                  Complete database of OHRT, CHRT, and TDPQ decisions spanning over 15 years
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Get instant summaries, key findings, and trend analysis powered by advanced AI
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Detailed Annotations</h3>
                <p className="text-gray-600">
                  Every case includes structured metadata, key findings, and expert commentary
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Educational Context</h3>
                <p className="text-gray-600">
                  Link cases directly to relevant course content and learning modules
                </p>
              </div>

              <div className="card hover:shadow-xl transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Citation Export</h3>
                <p className="text-gray-600">
                  Export citations in multiple formats for research papers and legal documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tribunal Coverage */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Tribunal Coverage
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive decisions from Canada's leading human rights tribunals
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">OHRT</h3>
                <p className="mb-3 text-sm text-gray-500">Ontario Human Rights Tribunal</p>
                <p className="mb-4 text-gray-600">
                  Complete archive of Ontario tribunal decisions covering employment, housing, services, and more
                </p>
                <div className="text-sm font-semibold text-primary-600">7,500+ decisions</div>
              </div>

              <div className="rounded-xl border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">CHRT</h3>
                <p className="mb-3 text-sm text-gray-500">Canadian Human Rights Tribunal</p>
                <p className="mb-4 text-gray-600">
                  Federal tribunal decisions addressing discrimination under Canadian Human Rights Act
                </p>
                <div className="text-sm font-semibold text-primary-600">1,800+ decisions</div>
              </div>

              <div className="rounded-xl border-2 border-gray-200 p-6 hover:border-primary-500 hover:shadow-lg transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">TDPQ</h3>
                <p className="mb-3 text-sm text-gray-500">Tribunal des droits de la personne du Québec</p>
                <p className="mb-4 text-gray-600">
                  Quebec tribunal decisions with bilingual coverage and French-language support
                </p>
                <div className="text-sm font-semibold text-primary-600">900+ decisions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Who Uses Our Case Database
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by legal professionals, HR experts, and educators
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="card">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Legal Professionals</h3>
                <p className="mb-4 text-gray-600">
                  Research precedents, prepare arguments, and stay current with evolving human rights jurisprudence
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Precedent research and citation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Trend analysis and pattern identification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Client education and case comparison</span>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="mb-3 text-xl font-bold text-gray-900">HR & Compliance</h3>
                <p className="mb-4 text-gray-600">
                  Understand organizational obligations, assess risks, and develop evidence-based policies
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Policy development guidance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Risk assessment and mitigation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Training scenario development</span>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Educators & Trainers</h3>
                <p className="mb-4 text-gray-600">
                  Incorporate real-world examples into curriculum and create engaging case-based learning experiences
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Curriculum development resources</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Real-world teaching examples</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Case study preparation</span>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="mb-3 text-xl font-bold text-gray-900">Researchers & Advocates</h3>
                <p className="mb-4 text-gray-600">
                  Analyze systemic patterns, document discrimination trends, and support advocacy efforts with data
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Data-driven research</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Pattern identification and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">Evidence-based advocacy</span>
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
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Access the Complete Database
            </h2>
            <p className="mb-8 text-xl text-blue-100">
              Start exploring thousands of tribunal decisions with powerful search and AI analysis
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/signup" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white/10">
                Request Demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • Immediate access • Full search capabilities
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
