import { BookOpen, Download, ExternalLink, FileText, Video } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Resources & Tools
            </h1>
            <p className="text-lg text-primary-50 md:text-xl">
              Free guides, templates, and resources to help you build more equitable workplaces.
            </p>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 bottom-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Featured Resources</h2>
            <p className="text-lg text-gray-600">
              Start with these comprehensive guides to understanding anti-Black racism in the workplace.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <FeaturedResourceCard
              title="Complete Guide to Anti-Black Racism in Canadian Workplaces"
              description="A comprehensive 50-page guide covering the history, impact, and strategies for addressing anti-Black racism in organizations across Canada."
              type="PDF Guide"
              size="2.4 MB"
              downloadUrl="#"
            />
            <FeaturedResourceCard
              title="AODA Compliance Toolkit"
              description="Everything you need to ensure your organization meets Accessibility for Ontarians with Disabilities Act requirements while promoting equity."
              type="Toolkit"
              size="5.1 MB"
              downloadUrl="#"
            />
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="relative bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Browse by Category</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Guides & Whitepapers */}
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <FileText className="h-6 w-6 text-primary-600" />
                Guides & Whitepapers
              </h3>
              <div className="space-y-4">
                <ResourceItem
                  title="Understanding Systemic Racism"
                  type="PDF"
                  size="1.2 MB"
                />
                <ResourceItem
                  title="Building Inclusive Hiring Practices"
                  type="PDF"
                  size="890 KB"
                />
                <ResourceItem
                  title="EDI Policy Template"
                  type="DOCX"
                  size="156 KB"
                />
                <ResourceItem
                  title="Microaggressions: A Field Guide"
                  type="PDF"
                  size="2.1 MB"
                />
              </div>
            </div>

            {/* Templates & Checklists */}
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Download className="h-6 w-6 text-primary-600" />
                Templates & Checklists
              </h3>
              <div className="space-y-4">
                <ResourceItem
                  title="Equity Audit Checklist"
                  type="PDF"
                  size="345 KB"
                />
                <ResourceItem
                  title="Inclusive Meeting Framework"
                  type="DOCX"
                  size="124 KB"
                />
                <ResourceItem
                  title="Complaint Response Template"
                  type="DOCX"
                  size="98 KB"
                />
                <ResourceItem
                  title="Annual EDI Report Template"
                  type="XLSX"
                  size="267 KB"
                />
              </div>
            </div>

            {/* Videos & Webinars */}
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Video className="h-6 w-6 text-primary-600" />
                Videos & Webinars
              </h3>
              <div className="space-y-4">
                <ResourceItem
                  title="Introduction to ABR Insights"
                  type="Video"
                  size="5 min"
                />
                <ResourceItem
                  title="Using AI for Case Analysis"
                  type="Webinar"
                  size="45 min"
                />
                <ResourceItem
                  title="Building Allyship in Teams"
                  type="Video"
                  size="12 min"
                />
                <ResourceItem
                  title="Monthly EDI Roundtable"
                  type="Webinar"
                  size="60 min"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-secondary-600 blur-3xl" />
        </div>
      </section>

      {/* Legal & Compliance Resources */}
      <section className="relative py-20">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Legal & Compliance</h2>
            <p className="text-lg text-gray-600">
              Stay up-to-date with Canadian employment law and human rights legislation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <LegalResourceCard
              title="Ontario Human Rights Code"
              description="Official documentation and interpretations of the OHRC as it relates to workplace discrimination."
              organization="Ontario Human Rights Commission"
              link="https://www.ohrc.on.ca"
            />
            <LegalResourceCard
              title="Canadian Human Rights Act"
              description="Federal legislation protecting against discrimination in federally regulated sectors."
              organization="Canadian Human Rights Commission"
              link="https://www.chrc-ccdp.gc.ca"
            />
            <LegalResourceCard
              title="Employment Equity Act"
              description="Federal law requiring employers to achieve equality in the workplace for designated groups."
              organization="Government of Canada"
              link="https://laws-lois.justice.gc.ca"
            />
            <LegalResourceCard
              title="Accessibility for Ontarians with Disabilities Act"
              description="Ontario legislation establishing accessibility standards across public and private sectors."
              organization="Government of Ontario"
              link="https://www.ontario.ca/page/accessibility"
            />
          </div>
        </div>
      </section>

      {/* External Resources */}
      <section className="relative bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">External Resources</h2>
            <p className="text-lg text-gray-600">
              Curated links to trusted organizations working to combat racism and promote equity.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ExternalLinkCard
              title="Black Legal Action Centre"
              description="Legal clinic providing free legal services to low-income Black people in Ontario."
              url="https://www.blacklegalactioncentre.ca"
            />
            <ExternalLinkCard
              title="Canadian Centre for Diversity and Inclusion"
              description="Research and resources for building inclusive workplaces across Canada."
              url="https://ccdi.ca"
            />
            <ExternalLinkCard
              title="Federation of Black Canadians"
              description="National organization advocating for the rights and interests of Black Canadians."
              url="https://www.fbcfcn.ca"
            />
            <ExternalLinkCard
              title="Congress of Black Women of Canada"
              description="Organization advancing the social, economic, and political well-being of Black women."
              url="https://cbwc.ca"
            />
            <ExternalLinkCard
              title="Black Business and Professional Association"
              description="Supporting Black business and professional development across Canada."
              url="https://bbpa.org"
            />
            <ExternalLinkCard
              title="African Canadian Legal Clinic"
              description="Providing legal services and advocacy for African Canadian communities."
              url="https://www.aclc.net"
            />
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute left-1/3 bottom-1/4 h-80 w-80 rounded-full bg-secondary-600 blur-3xl" />
        </div>
      </section>

      {/* Newsletter Signup CTA */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Stay Updated
            </h2>
            <p className="mb-8 text-lg text-primary-50">
              Subscribe to our newsletter for monthly resources, case updates, and best practices.
            </p>
            <form className="mx-auto flex max-w-md gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button type="submit" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Supporting Components
function FeaturedResourceCard({
  title,
  description,
  type,
  size,
  downloadUrl,
}: {
  title: string
  description: string
  type: string
  size: string
  downloadUrl: string
}) {
  return (
    <div className="card group">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-primary-100 p-3">
          <FileText className="h-8 w-8 text-primary-600" />
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {type}
        </span>
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{size}</span>
        <a
          href={downloadUrl}
          className="flex items-center gap-2 text-primary-600 transition-colors hover:text-primary-700"
        >
          <Download className="h-5 w-5" />
          <span className="font-medium">Download</span>
        </a>
      </div>
    </div>
  )
}

function ResourceItem({ title, type, size }: { title: string; type: string; size: string }) {
  return (
    <a
      href="#"
      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:bg-primary-50"
    >
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-primary-600" />
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{size}</div>
        </div>
      </div>
      <Download className="h-5 w-5 text-gray-400" />
    </a>
  )
}

function LegalResourceCard({
  title,
  description,
  organization,
  link,
}: {
  title: string
  description: string
  organization: string
  link: string
}) {
  return (
    <div className="card">
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-3 text-gray-600">{description}</p>
      <div className="mb-4 text-sm text-gray-500">{organization}</div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary-600 transition-colors hover:text-primary-700"
      >
        <span className="font-medium">View Resource</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}

function ExternalLinkCard({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group transition-all hover:border-primary-300"
    >
      <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
        {title}
      </h3>
      <p className="mb-3 text-gray-600">{description}</p>
      <div className="flex items-center gap-2 text-primary-600">
        <span className="text-sm font-medium">Visit Website</span>
        <ExternalLink className="h-4 w-4" />
      </div>
    </a>
  )
}
