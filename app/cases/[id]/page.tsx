import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Building2, 
  AlertTriangle, 
  TrendingUp,
  Bookmark,
  Share2,
  FileDown,
  ArrowLeft,
  Tag,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Generate static paths for sample cases
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}

// TODO: Replace with actual database fetch
async function getCaseStudy(id: string) {
  // Placeholder case data
  const cases: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Workplace Discrimination and Wrongful Termination at Tech Company',
      date: '2023-08-15',
      location: 'Toronto, ON',
      industry: 'Technology',
      organizationType: 'Private Company',
      severity: 'High',
      outcome: 'Settlement',
      status: 'Resolved',
      summary: 'A senior software engineer experienced racial discrimination, microaggressions, and eventual wrongful termination after reporting concerns about workplace equity. The case was settled out of court with the company implementing mandatory anti-racism training and revising their performance review processes.',
      fullText: `Background:
A Black senior software engineer (referred to as "Engineer A") joined a major tech company in Toronto in 2021. Despite strong performance reviews in the first year, Engineer A began experiencing increased scrutiny and microaggressions after raising concerns about the lack of diversity in leadership positions during a company town hall.

Incidents:
- Manager began excluding Engineer A from key technical meetings and strategic planning sessions
- Performance feedback became increasingly critical despite consistent code quality metrics
- Comments from colleagues about Engineer A being "aggressive" and "not a cultural fit" when expressing technical opinions
- Denied promotion despite meeting all stated criteria, while less experienced white colleagues were promoted
- Placed on a Performance Improvement Plan (PIP) after raising discrimination concerns with HR

Investigation:
- Internal HR investigation found "no evidence of discrimination" despite documented patterns
- Engineer A filed a complaint with the Ontario Human Rights Tribunal
- Third-party review commissioned as part of tribunal proceedings revealed systemic issues:
  * Only 2% of leadership positions held by Black employees
  * Black employees 3x more likely to be placed on PIPs
  * Promotion rates for Black employees significantly lower across all levels

Outcome:
- Case settled confidentially before tribunal hearing
- Company agreed to:
  * Implement mandatory anti-racism training for all staff and leadership
  * Revise performance review processes with external audit
  * Establish diversity targets for leadership positions
  * Create independent reporting mechanism for discrimination complaints
- Engineer A received financial settlement and non-disparagement agreement

Lessons Learned:
This case highlights the importance of:
1. Taking employee discrimination complaints seriously and conducting thorough, impartial investigations
2. Examining organizational data for patterns of racial disparity
3. Creating safe reporting mechanisms independent of direct management chains
4. Ensuring performance management systems are applied equitably
5. Moving beyond diversity statements to measurable accountability`,
      keyPhrases: [
        'workplace discrimination',
        'wrongful termination',
        'microaggressions',
        'performance improvement plan',
        'Ontario Human Rights Tribunal',
        'systemic racism',
        'retaliation',
        'cultural fit',
      ],
      classifications: [
        { category: 'Type of Discrimination', value: 'Employment Discrimination' },
        { category: 'Context', value: 'Workplace' },
        { category: 'Sector', value: 'Technology' },
        { category: 'Legal Mechanism', value: 'Human Rights Tribunal' },
        { category: 'Stage', value: 'Settlement' },
      ],
      timeline: [
        { date: '2021-03', event: 'Engineer A joins company', type: 'neutral' },
        { date: '2022-02', event: 'First performance review - "Exceeds Expectations"', type: 'positive' },
        { date: '2022-06', event: 'Raises diversity concerns at town hall', type: 'neutral' },
        { date: '2022-08', event: 'Excluded from strategic planning meetings', type: 'negative' },
        { date: '2022-11', event: 'Denied promotion despite meeting criteria', type: 'negative' },
        { date: '2023-01', event: 'Files internal HR complaint', type: 'neutral' },
        { date: '2023-02', event: 'Placed on Performance Improvement Plan', type: 'negative' },
        { date: '2023-03', event: 'Files Ontario Human Rights Tribunal complaint', type: 'neutral' },
        { date: '2023-06', event: 'Third-party investigation commissioned', type: 'neutral' },
        { date: '2023-08', event: 'Case settled confidentially', type: 'positive' },
      ],
      impact: {
        individual: 'Significant psychological distress, career disruption, financial loss during unemployment period',
        organizational: 'Reputation damage, legal costs, mandatory organizational changes',
        systemic: 'Highlighted need for tech industry to address diversity and inclusion gaps',
      },
      relatedCases: [
        { id: '2', title: 'Discriminatory Hiring Practices in Financial Services', similarity: 0.87, tags: ['Employment', 'Hiring'] },
        { id: '3', title: 'Promotion Bias in Healthcare Administration', similarity: 0.82, tags: ['Employment', 'Advancement'] },
        { id: '4', title: 'Retaliation After Discrimination Complaint', similarity: 0.79, tags: ['Retaliation', 'HR'] },
      ],
    },
  }

  return cases[id] || null
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const caseStudy = await getCaseStudy(params.id)

  if (!caseStudy) {
    return {
      title: 'Case Not Found',
    }
  }

  return {
    title: `${caseStudy.title} | ABR Insights`,
    description: caseStudy.summary.slice(0, 155),
  }
}

export default async function CasePage({ params }: { params: { id: string } }) {
  const caseStudy = await getCaseStudy(params.id)

  if (!caseStudy) {
    notFound()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Settlement': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Verdict': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Dismissed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'negative': return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container-custom py-8">
          <div className="mb-4">
            <Link href="/cases" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case Explorer
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">{caseStudy.title}</h1>
              
              {/* Key Metadata */}
              <div className="flex flex-wrap gap-3">
                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium ${getSeverityColor(caseStudy.severity)}`}>
                  <AlertTriangle className="h-4 w-4" />
                  {caseStudy.severity} Severity
                </div>
                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium ${getOutcomeColor(caseStudy.outcome)}`}>
                  <TrendingUp className="h-4 w-4" />
                  {caseStudy.outcome}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                aria-label="Bookmark case"
              >
                <Bookmark className="h-4 w-4" />
                Save
              </button>
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                aria-label="Share case"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                aria-label="Export case"
              >
                <FileDown className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 w-full justify-start border-b border-gray-200 bg-transparent">
                  <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="fulltext" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                    Full Case
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600">
                    Analysis
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Case Summary</h2>
                    <p className="text-gray-700 leading-relaxed">{caseStudy.summary}</p>
                  </div>

                  {/* Key Phrases */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <div className="mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Key Phrases</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {caseStudy.keyPhrases.map((phrase: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Full Text Tab */}
                <TabsContent value="fulltext">
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Full Case Details</h2>
                    <div className="prose max-w-none text-gray-700">
                      {caseStudy.fullText.split('\n\n').map((paragraph: string, index: number) => {
                        const isHeading = paragraph.endsWith(':')
                        return isHeading ? (
                          <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-gray-900">
                            {paragraph}
                          </h3>
                        ) : (
                          <p key={index} className="mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Case Timeline</h2>
                    <div className="relative space-y-6">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      
                      {caseStudy.timeline.map((item: any, index: number) => (
                        <div key={index} className="relative flex gap-4">
                          <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-50">
                            {getTimelineIcon(item.type)}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="mb-1 text-sm text-gray-500">{item.date}</div>
                            <div className="font-medium text-gray-900">{item.event}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <div className="mb-6 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Impact Analysis</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-semibold text-gray-900">Individual Impact</h3>
                        <p className="text-gray-700">{caseStudy.impact.individual}</p>
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold text-gray-900">Organizational Impact</h3>
                        <p className="text-gray-700">{caseStudy.impact.organizational}</p>
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold text-gray-900">Systemic Impact</h3>
                        <p className="text-gray-700">{caseStudy.impact.systemic}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Classifications */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">AI Classifications</h3>
                    <div className="space-y-3">
                      {caseStudy.classifications.map((classification: any, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <span className="text-sm font-medium text-gray-700">{classification.category}</span>
                          <Badge variant="outline">{classification.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Discussion Section */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
                <div className="mb-6 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Discussion & Notes</h2>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <p className="text-gray-600">
                    Sign in to add your notes and participate in the discussion
                  </p>
                  <Link href="/auth/login" className="btn-primary mt-4">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Case Metadata */}
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Case Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-gray-600">Date</div>
                      <div className="font-medium text-gray-900">{caseStudy.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-gray-600">Location</div>
                      <div className="font-medium text-gray-900">{caseStudy.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-gray-600">Industry</div>
                      <div className="font-medium text-gray-900">{caseStudy.industry}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-gray-600">Organization Type</div>
                      <div className="font-medium text-gray-900">{caseStudy.organizationType}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Cases */}
              {caseStudy.relatedCases && caseStudy.relatedCases.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Related Cases</h3>
                  <div className="space-y-4">
                    {caseStudy.relatedCases.map((related: any) => (
                      <Link
                        key={related.id}
                        href={`/cases/${related.id}`}
                        className="group block rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-md"
                      >
                        <div className="mb-2 text-sm font-medium text-gray-900 group-hover:text-primary-600">
                          {related.title}
                        </div>
                        <div className="mb-2 flex flex-wrap gap-1">
                          {related.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600">
                          {Math.round(related.similarity * 100)}% similarity
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/cases" className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                    Explore more cases
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
