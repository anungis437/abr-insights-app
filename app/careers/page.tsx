import { Briefcase, MapPin, Clock, DollarSign, Users, Heart, TrendingUp, Award } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-16 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <Briefcase className="h-12 w-12" />
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Join Our Mission
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Help us build a more equitable future by empowering organizations to combat anti-Black racism in Canadian workplaces
            </p>
            <button className="btn-primary border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
              View Open Positions
            </button>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute left-1/4 bottom-1/4 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Why Join Us */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Why Work at ABR Insights?
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <ValueCard
                icon={<Heart className="h-8 w-8" />}
                title="Meaningful Impact"
                description="Your work directly contributes to creating more equitable workplaces across Canada"
              />
              <ValueCard
                icon={<Users className="h-8 w-8" />}
                title="Diverse Team"
                description="Join a team that reflects the diversity we champion, with lived experiences that inform our work"
              />
              <ValueCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Growth Opportunities"
                description="Continuous learning, professional development, and clear career advancement paths"
              />
              <ValueCard
                icon={<Award className="h-8 w-8" />}
                title="Recognition"
                description="Competitive compensation, benefits, and acknowledgment of exceptional contributions"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Benefits & Perks
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BenefitCard
                title="Health & Wellness"
                benefits={[
                  'Comprehensive health, dental, and vision coverage',
                  'Mental health support and counseling services',
                  'Wellness stipend for fitness and self-care',
                  'Flexible health spending account'
                ]}
              />
              <BenefitCard
                title="Work-Life Balance"
                benefits={[
                  'Flexible hybrid work arrangements',
                  'Unlimited PTO with 3-week minimum',
                  'Paid parental leave (6 months)',
                  'Summer Fridays (half-day)'
                ]}
              />
              <BenefitCard
                title="Financial"
                benefits={[
                  'Competitive salary with equity options',
                  'RRSP matching up to 5%',
                  'Annual performance bonuses',
                  'Professional development budget ($5K/year)'
                ]}
              />
              <BenefitCard
                title="Professional Growth"
                benefits={[
                  'Conference and training allowance',
                  'Mentorship program',
                  'Internal mobility opportunities',
                  'Leadership development track'
                ]}
              />
              <BenefitCard
                title="Office & Equipment"
                benefits={[
                  'Modern downtown Toronto office',
                  'Top-tier equipment and software',
                  'Home office setup stipend',
                  'Co-working space membership'
                ]}
              />
              <BenefitCard
                title="Community & Culture"
                benefits={[
                  'Regular team building events',
                  'Diversity & inclusion initiatives',
                  'Volunteer time off (5 days/year)',
                  'Employee resource groups'
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Open Positions
            </h2>
            
            {/* Engineering */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Engineering</h3>
              <div className="space-y-4">
                <JobCard
                  title="Senior Full-Stack Engineer"
                  department="Engineering"
                  location="Toronto, ON (Hybrid)"
                  type="Full-Time"
                  salary="$120K - $160K"
                  description="Lead the development of our AI-powered platform. Work with React, Node.js, Python, and Azure OpenAI."
                  requirements={['5+ years full-stack experience', 'React & TypeScript expertise', 'Experience with AI/ML systems']}
                />
                <JobCard
                  title="Machine Learning Engineer"
                  department="Engineering"
                  location="Remote (Canada)"
                  type="Full-Time"
                  salary="$130K - $180K"
                  description="Build and improve our NLP models for case classification and semantic search. Work with Python, PyTorch, and Azure ML."
                  requirements={['3+ years ML experience', 'NLP expertise', 'Production ML system experience']}
                />
              </div>
            </div>

            {/* Product & Design */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Product & Design</h3>
              <div className="space-y-4">
                <JobCard
                  title="Product Manager"
                  department="Product"
                  location="Toronto, ON (Hybrid)"
                  type="Full-Time"
                  salary="$110K - $145K"
                  description="Drive product strategy and roadmap for our learning platform. Partner with engineering, design, and customers."
                  requirements={['4+ years product management', 'B2B SaaS experience', 'User-centered design mindset']}
                />
                <JobCard
                  title="UX/UI Designer"
                  department="Design"
                  location="Toronto, ON (Hybrid)"
                  type="Full-Time"
                  salary="$85K - $115K"
                  description="Design intuitive, accessible interfaces for complex data and learning experiences. Conduct user research."
                  requirements={['3+ years UX/UI design', 'Figma proficiency', 'Accessibility expertise (WCAG 2.1)']}
                />
              </div>
            </div>

            {/* Content & Research */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Content & Research</h3>
              <div className="space-y-4">
                <JobCard
                  title="Legal Researcher"
                  department="Research"
                  location="Remote (Canada)"
                  type="Full-Time"
                  salary="$70K - $95K"
                  description="Analyze human rights tribunal decisions, identify patterns, and contribute to our case database and insights."
                  requirements={['J.D. or LLM preferred', 'Human rights law expertise', 'Strong analytical writing']}
                />
                <JobCard
                  title="Learning Experience Designer"
                  department="Content"
                  location="Toronto, ON (Hybrid)"
                  type="Full-Time"
                  salary="$75K - $105K"
                  description="Create engaging, evidence-based courses on anti-racism and workplace equity. Work with subject matter experts."
                  requirements={['3+ years instructional design', 'Adult learning principles', 'EDI content experience']}
                />
              </div>
            </div>

            {/* Operations */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Operations</h3>
              <div className="space-y-4">
                <JobCard
                  title="Customer Success Manager"
                  department="Operations"
                  location="Toronto, ON (Hybrid)"
                  type="Full-Time"
                  salary="$65K - $85K"
                  description="Ensure customer adoption and success. Provide strategic guidance to organizations on implementing anti-racism practices."
                  requirements={['2+ years customer success', 'B2B SaaS experience', 'Strong communication skills']}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              Our Hiring Process
            </h2>
            <div className="grid gap-8 md:grid-cols-4">
              <ProcessStep
                number={1}
                title="Apply"
                description="Submit your resume and cover letter through our application portal"
              />
              <ProcessStep
                number={2}
                title="Initial Screen"
                description="30-minute conversation with our recruiting team about your background"
              />
              <ProcessStep
                number={3}
                title="Team Interviews"
                description="Meet with hiring manager and team members (2-3 interviews)"
              />
              <ProcessStep
                number={4}
                title="Offer"
                description="Receive offer, negotiate details, and join our mission"
              />
            </div>
            <div className="mt-12 rounded-lg bg-blue-50 p-8 text-center">
              <p className="text-gray-700">
                <strong>We&rsquo;re committed to fair hiring:</strong> Our process is designed to reduce bias and ensure 
                equitable evaluation. We provide accommodations, anonymize initial reviews, and use structured interviews 
                with diverse panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diversity Statement */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              Diversity, Equity & Inclusion
            </h2>
            <p className="mb-6 text-lg text-gray-700">
              ABR Insights is committed to building a diverse, equitable, and inclusive workplace. We believe that 
              lived experiences with racism and discrimination bring invaluable perspectives to our mission.
            </p>
            <p className="mb-6 text-lg text-gray-700">
              We strongly encourage applications from Black, Indigenous, and racialized individuals, as well as 
              people with disabilities, LGBTQ2S+ individuals, and members of other equity-deserving communities.
            </p>
            <p className="text-lg text-gray-700">
              We provide accommodations throughout the hiring process. Please let us know how we can support you 
              by contacting <a href="mailto:careers@abrinsights.ca" className="text-primary-600 hover:text-primary-700">careers@abrinsights.ca</a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Don&rsquo;t See the Right Role?</h2>
            <p className="mb-8 text-xl text-blue-100">
              We&rsquo;re always looking for talented individuals who share our mission. Send us your resume and 
              tell us how you&rsquo;d like to contribute.
            </p>
            <button className="btn-primary border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
              Send General Application
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ValueCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center text-primary-600">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function BenefitCard({
  title,
  benefits
}: {
  title: string
  benefits: string[]
}) {
  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-bold text-gray-900">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-0.5 text-green-600">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  )
}

function JobCard({
  title,
  department,
  location,
  type,
  salary,
  description,
  requirements
}: {
  title: string
  department: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
}) {
  return (
    <div className="card group border-l-4 border-l-primary-600 transition-all hover:shadow-xl">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600">
            {title}
          </h4>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {type}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {salary}
            </span>
          </div>
        </div>
      </div>
      
      <p className="mb-4 text-gray-700">{description}</p>
      
      <div className="mb-4">
        <h5 className="mb-2 font-semibold text-gray-900">Key Requirements:</h5>
        <ul className="space-y-1 text-sm text-gray-700">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              {req}
            </li>
          ))}
        </ul>
      </div>
      
      <button className="btn-primary w-full">
        Apply for this Position
      </button>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  description
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="relative text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
