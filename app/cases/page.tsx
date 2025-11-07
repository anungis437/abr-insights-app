import { Scale, Search, Filter, Calendar, MapPin, FileText, TrendingUp, Bookmark, Download } from 'lucide-react'

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-24 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <Scale className="h-16 w-16" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Case Explorer
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Search and analyze 10,000+ tribunal decisions with AI-powered insights
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold">10,247</div>
                <div className="text-sm text-blue-100">Total Cases</div>
              </div>
              <div className="h-12 w-px bg-blue-300"></div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold">3</div>
                <div className="text-sm text-blue-100">Tribunals</div>
              </div>
              <div className="h-12 w-px bg-blue-300"></div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold">15+</div>
                <div className="text-sm text-blue-100">Years of Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute left-1/3 bottom-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="card mx-auto -mt-16 max-w-6xl">
            {/* Main Search */}
            <div className="mb-6">
              <label htmlFor="main-search" className="mb-2 block text-sm font-medium text-gray-700">
                Search Cases
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="main-search"
                  placeholder="Search by keywords, case name, decision maker, or citation..."
                  className="input-field w-full py-3 pl-12 pr-4 text-lg"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label htmlFor="tribunal" className="mb-2 block text-sm font-medium text-gray-700">
                  Tribunal
                </label>
                <select id="tribunal" className="input-field w-full">
                  <option value="">All Tribunals</option>
                  <option value="ohrt">Ontario Human Rights Tribunal (OHRT)</option>
                  <option value="chrt">Canadian Human Rights Tribunal (CHRT)</option>
                  <option value="tdpq">Quebec Tribunal des droits de la personne</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="province" className="mb-2 block text-sm font-medium text-gray-700">
                  Province
                </label>
                <select id="province" className="input-field w-full">
                  <option value="">All Provinces</option>
                  <option value="ON">Ontario</option>
                  <option value="QC">Quebec</option>
                  <option value="BC">British Columbia</option>
                  <option value="AB">Alberta</option>
                  <option value="MB">Manitoba</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="NB">New Brunswick</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select id="category" className="input-field w-full">
                  <option value="">All Categories</option>
                  <option value="employment">Employment</option>
                  <option value="housing">Housing</option>
                  <option value="services">Services</option>
                  <option value="education">Education</option>
                  <option value="police">Police Conduct</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="year" className="mb-2 block text-sm font-medium text-gray-700">
                  Year
                </label>
                <select id="year" className="input-field w-full">
                  <option value="">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="older">2018 and earlier</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                <strong>1,247 cases</strong> match your search criteria
              </p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  <Filter className="h-4 w-4" />
                  More Filters
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  <Download className="h-4 w-4" />
                  Export Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Banner */}
      <section className="px-4 py-6">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="mb-2 font-semibold">AI-Powered Analysis Available</h3>
                <p className="text-sm text-purple-100">
                  Our AI has analyzed patterns in your search results. Upgrade to Professional to see key insights, 
                  legal precedents, and comparative analysis across similar cases.
                </p>
              </div>
              <button className="btn-primary ml-auto flex-shrink-0 bg-white text-purple-600 hover:bg-gray-50">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            {/* Sort Options */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select id="sort" className="input-field w-auto py-2">
                  <option value="relevance">Relevance</option>
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="citation">Citation</option>
                </select>
              </div>
            </div>

            {/* Case Cards */}
            <div className="space-y-4">
              <CaseCard
                title="Smith v. ABC Corporation"
                citation="2024 OHRT 123"
                tribunal="Ontario Human Rights Tribunal"
                date="March 15, 2024"
                category="Employment"
                summary="Applicant alleged discrimination on the basis of race in hiring and promotion decisions. Tribunal found systemic barriers in performance evaluation process and awarded damages for lost wages and injury to dignity."
                tags={['Hiring Discrimination', 'Promotion Barriers', 'Systemic Racism', 'Damages Awarded']}
              />
              
              <CaseCard
                title="Johnson v. City Housing Authority"
                citation="2024 OHRT 98"
                tribunal="Ontario Human Rights Tribunal"
                date="February 28, 2024"
                category="Housing"
                summary="Applicant experienced racial profiling and harassment from building management. Tribunal ordered remedial training and compensation for differential treatment in rental accommodation."
                tags={['Racial Profiling', 'Housing Discrimination', 'Harassment', 'Accommodation']}
              />
              
              <CaseCard
                title="Williams et al. v. Provincial Police Services"
                citation="2024 CHRT 45"
                tribunal="Canadian Human Rights Tribunal"
                date="January 20, 2024"
                category="Police Conduct"
                summary="Multiple applicants alleged discriminatory policing practices including excessive force and carding. Tribunal found systemic discrimination and ordered policy reforms and compensation."
                tags={['Police Conduct', 'Excessive Force', 'Carding', 'Systemic Discrimination', 'Policy Reform']}
                featured={true}
              />
              
              <CaseCard
                title="Brown v. University Board of Governors"
                citation="2023 OHRT 456"
                tribunal="Ontario Human Rights Tribunal"
                date="November 10, 2023"
                category="Education"
                summary="Student alleged discriminatory treatment in academic disciplinary process. Tribunal found procedural unfairness and bias in investigation, ordered expungement of record."
                tags={['Education', 'Disciplinary Process', 'Procedural Fairness', 'Academic Records']}
              />
              
              <CaseCard
                title="Thompson v. Retail Chain Inc."
                citation="2023 OHRT 389"
                tribunal="Ontario Human Rights Tribunal"
                date="September 5, 2023"
                category="Services"
                summary="Applicant alleged discriminatory surveillance and customer service practices. Tribunal awarded damages for humiliation and found systemic issues in staff training."
                tags={['Customer Service', 'Surveillance', 'Retail Discrimination', 'Training Required']}
              />
              
              <CaseCard
                title="Davis v. Healthcare Provider"
                citation="2023 OHRT 312"
                tribunal="Ontario Human Rights Tribunal"
                date="July 18, 2023"
                category="Services"
                summary="Applicant experienced differential treatment in medical care delivery based on race. Tribunal found Code violations and ordered cultural competency training for staff."
                tags={['Healthcare', 'Differential Treatment', 'Cultural Competency', 'Medical Services']}
              />
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
                1
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                42
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">Unlock Advanced Case Analysis</h2>
          <p className="mb-8 text-xl text-blue-100">
            Get AI-powered insights, semantic search, and comparative analysis with a Professional plan
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

function CaseCard({
  title,
  citation,
  tribunal,
  date,
  category,
  summary,
  tags,
  featured = false
}: {
  title: string
  citation: string
  tribunal: string
  date: string
  category: string
  summary: string
  tags: string[]
  featured?: boolean
}) {
  return (
    <div className={`card cursor-pointer transition-all hover:shadow-xl ${
      featured ? 'border-2 border-primary-300 bg-primary-50' : ''
    }`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600">
              {title}
            </h3>
            {featured && (
              <span className="rounded-full bg-primary-600 px-2 py-1 text-xs font-semibold text-white">
                Featured
              </span>
            )}
          </div>
          <p className="mb-2 font-mono text-sm font-medium text-gray-700">{citation}</p>
        </div>
        <button 
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
          title="Bookmark this case"
          aria-label="Bookmark this case"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Scale className="h-4 w-4" />
          <span>{tribunal}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{category}</span>
        </div>
      </div>

      <p className="mb-4 text-gray-700">{summary}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View Full Decision →
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </div>
  )
}
