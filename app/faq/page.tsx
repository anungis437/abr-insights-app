import { Metadata } from 'next'
import { HelpCircle, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | ABR Insights',
  description:
    'Find answers to common questions about ABR Insights platform, pricing, data security, training courses, and technical support.',
}

const faqCategories = [
  {
    category: 'Platform & Features',
    questions: [
      {
        question: 'What is ABR Insights?',
        answer:
          'ABR Insights is a comprehensive platform designed to help organizations understand, track, and address anti-Black racism through data-driven insights, interactive training courses, and an extensive case database. Our platform combines AI-powered analytics with expert-curated content to provide actionable strategies for building more equitable workplaces.',
      },
      {
        question: 'How does the Case Explorer work?',
        answer:
          'The Case Explorer allows you to search and analyze thousands of documented cases of anti-Black racism from various contexts including workplaces, education, healthcare, and justice systems. You can filter by industry, severity, location, and outcome. Our AI provides pattern recognition and similarity analysis to help identify systemic issues and effective interventions.',
      },
      {
        question: 'What makes ABR Insights different from other DEI platforms?',
        answer:
          'ABR Insights is specifically focused on anti-Black racism with deep expertise in this area. We combine quantitative data analysis with qualitative case studies, leverage AI for pattern recognition, and provide actionable recommendations based on documented outcomes. Our platform is built by experts with lived experience and academic credentials in racial equity.',
      },
      {
        question: 'Can I integrate ABR Insights with our existing systems?',
        answer:
          'Yes, we offer API access and integrations with popular HRIS, LMS, and analytics platforms. Our Enterprise plan includes custom integration support and dedicated technical assistance to ensure seamless connectivity with your existing infrastructure.',
      },
      {
        question: 'Is the platform accessible for users with disabilities?',
        answer:
          'Absolutely. We are committed to WCAG 2.1 Level AA compliance and continuously test our platform with assistive technologies. Features include keyboard navigation, screen reader support, high contrast modes, and adjustable text sizes. Visit our Accessibility page for detailed information.',
      },
    ],
  },
  {
    category: 'Pricing & Plans',
    questions: [
      {
        question: 'What&apos;s included in the free Starter plan?',
        answer:
          'The Starter plan includes access to 5 foundational courses, limited case database searches (up to 50 per month), basic analytics dashboard, and community forum access. This plan is perfect for individuals or small teams exploring anti-racism training.',
      },
      {
        question: 'How does the Professional plan differ from Starter?',
        answer:
          'The Professional plan ($49/user/month) unlocks unlimited access to all 50+ courses, full case database with unlimited searches, advanced analytics and reporting, team collaboration tools, and priority email support. It&apos;s designed for organizations serious about implementing comprehensive anti-racism initiatives.',
      },
      {
        question: 'What benefits does the Enterprise plan offer?',
        answer:
          'Enterprise includes everything in Professional plus: custom course development, dedicated account manager, API access, SSO integration, advanced security features, custom reporting, on-site training sessions, and 24/7 phone support. Pricing is customized based on your organization&apos;s size and needs.',
      },
      {
        question: 'Can I switch plans at any time?',
        answer:
          'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle. Any unused portion of your current plan is prorated and credited to your account.',
      },
      {
        question: 'Do you offer discounts for non-profits or educational institutions?',
        answer:
          'Yes, we offer a 30% discount for registered non-profit organizations and educational institutions. Contact our sales team with your organization&apos;s documentation to qualify for this special pricing.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, Mastercard, American Express, Discover), ACH bank transfers, and wire transfers for Enterprise customers. All payments are processed securely through Stripe.',
      },
    ],
  },
  {
    category: 'Data Security & Privacy',
    questions: [
      {
        question: 'How is my organization&apos;s data protected?',
        answer:
          'We employ enterprise-grade security including AES-256 encryption at rest, TLS 1.3 for data in transit, SOC 2 Type II compliance, regular security audits, and role-based access controls. All data is stored in secure Canadian data centers with redundant backups.',
      },
      {
        question: 'Who can see our organization&apos;s analytics data?',
        answer:
          'Your organization&apos;s data is completely private and siloed. Only users within your organization with appropriate permissions can access your analytics. ABR Insights staff never access your data without explicit written permission, except for anonymized, aggregated data used to improve platform performance.',
      },
      {
        question: 'Are the case studies based on real events?',
        answer:
          'Yes, all cases in our database are based on documented real-world incidents. However, identifying information is removed or anonymized to protect privacy while maintaining the educational value and context of each case.',
      },
      {
        question: 'How do you handle PIPEDA and GDPR compliance?',
        answer:
          'We are fully compliant with both PIPEDA (Canadian privacy law) and GDPR (EU). We provide data processing agreements, support data subject rights requests, maintain detailed processing records, and allow you to export or delete your data at any time.',
      },
      {
        question: 'Can I export my organization&apos;s data?',
        answer:
          'Yes, you can export your organization&apos;s data at any time in standard formats (CSV, JSON) through your account dashboard. Enterprise customers also have access to API endpoints for automated data export.',
      },
    ],
  },
  {
    category: 'Training & Courses',
    questions: [
      {
        question: 'How long does it take to complete a typical course?',
        answer:
          'Most courses range from 30 minutes to 2 hours of content, designed to be completed in multiple sessions. All courses include video lessons, interactive exercises, knowledge checks, and additional resources. You can progress at your own pace with automatic progress tracking.',
      },
      {
        question: 'Do courses offer certificates upon completion?',
        answer:
          'Yes, all completed courses provide digital certificates that include course details, completion date, and a unique verification code. Certificates can be shared on LinkedIn or downloaded as PDFs. Enterprise customers can customize certificate branding.',
      },
      {
        question: 'Are the courses accredited?',
        answer:
          'While not formally accredited by a university, our courses are developed by subject matter experts with PhDs in relevant fields and reviewed by legal professionals where applicable. Many organizations count our training hours toward DEI training requirements.',
      },
      {
        question: 'Can we create custom courses for our organization?',
        answer:
          'Yes, Enterprise customers can work with our content team to develop custom courses tailored to your organization&apos;s specific context, industry, and challenges. Custom courses follow the same interactive format and quality standards as our core curriculum.',
      },
      {
        question: 'How often is course content updated?',
        answer:
          'We review and update all course content quarterly to ensure it reflects the latest research, legal developments, and best practices. Major updates are announced to all users, and you&apos;ll see update notifications on course pages.',
      },
    ],
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'What kind of support is available?',
        answer:
          'Starter users have access to our knowledge base and community forums. Professional users receive priority email support with 24-hour response time. Enterprise customers get dedicated account managers and 24/7 phone support for urgent issues.',
      },
      {
        question: 'What are your system requirements?',
        answer:
          'ABR Insights is a web-based platform that works on all modern browsers (Chrome, Firefox, Safari, Edge). We recommend using the latest browser version for the best experience. Mobile apps for iOS and Android are coming in Q2 2026.',
      },
      {
        question: 'Can I access ABR Insights on mobile devices?',
        answer:
          'Yes, our platform is fully responsive and works on smartphones and tablets through your web browser. While the desktop experience offers more advanced analytics features, all core functionality including courses and case browsing is available on mobile.',
      },
      {
        question: 'What if I encounter a technical issue?',
        answer:
          'First, check our Help Center for common solutions. If you can&apos;t resolve the issue, contact support through your account dashboard. Include screenshots and details about what you were doing when the issue occurred for faster resolution.',
      },
      {
        question: 'Do you provide training for administrators?',
        answer:
          'Yes, Professional and Enterprise customers receive onboarding sessions for administrators covering user management, analytics interpretation, and best practices. We also offer ongoing webinars and documentation updates.',
      },
    ],
  },
  {
    category: 'Implementation & Onboarding',
    questions: [
      {
        question: 'How long does implementation take?',
        answer:
          'For most organizations, you can start using ABR Insights immediately after sign-up. Professional users can invite team members and start training within minutes. Enterprise implementations with SSO, custom integrations, and training sessions typically take 2-4 weeks.',
      },
      {
        question: 'Do you provide onboarding assistance?',
        answer:
          'Yes, all new Professional and Enterprise customers receive guided onboarding including platform walkthrough, best practices training, and help setting up your team structure and initial courses. Enterprise customers also get a dedicated success manager.',
      },
      {
        question: 'Can we pilot the platform before full rollout?',
        answer:
          'Absolutely. We recommend starting with a small pilot group (10-50 users) to gather feedback and refine your approach. Professional and Enterprise plans allow you to scale up easily by adding more users as your program expands.',
      },
      {
        question: 'What resources are available for change management?',
        answer:
          'We provide implementation guides, email templates, presentation decks, and communication strategies to help you introduce ABR Insights to your organization. Enterprise customers receive customized change management support from our team.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      {' '}
      <div className="min-h-screen bg-white pt-16">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
          <div className="container-custom">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <HelpCircle className="h-8 w-8" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
              <p className="text-lg text-primary-50 md:text-xl">
                Find answers to common questions about our platform, pricing, security, and more.
                Can&apos;t find what you&apos;re looking for? Contact our support team.
              </p>
            </div>
          </div>

          {/* Decorative gradient blur */}
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 blur-3xl"></div>
          <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl"></div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">{category.category}</h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="rounded-lg border border-gray-200 bg-white px-6 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:text-primary-600 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="bg-gray-50 py-20">
          <div className="container-custom">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Still Have Questions?</h2>
              <p className="mb-8 text-lg text-gray-600">
                Our support team is here to help. Get in touch and we&apos;ll respond as soon as
                possible.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a href="/contact" className="btn-primary inline-flex items-center justify-center">
                  Contact Support
                </a>
                <a
                  href="mailto:support@abrinsights.ca"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
