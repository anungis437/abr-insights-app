import { Check, X } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans | ABR Insights - Start Free Today',
  description: 'Flexible pricing for organizations of all sizes. Free plan available. Access tribunal case databases, expert training, and analytics to build more equitable workplaces.',
  keywords: ['pricing', 'plans', 'free trial', 'anti-racism training cost', 'EDI platform pricing', 'HR analytics pricing'],
  openGraph: {
    title: 'ABR Insights Pricing | Plans Starting Free',
    description: 'Choose the right plan for your organization. Free, Professional, and Enterprise options available with transparent pricing.',
    type: 'website',
    url: 'https://abrinsights.ca/pricing',
    siteName: 'ABR Insights',
  },
  twitter: {
    card: 'summary',
    title: 'ABR Insights Pricing',
    description: 'Transparent pricing for anti-racism training and workplace equity tools.',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-primary-50 md:text-xl">
              Choose the plan that fits your organization&apos;s needs. All plans include core
              features with no hidden fees.
            </p>
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-10">
          <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute left-1/3 bottom-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Free Tier */}
            <PricingCard
              name="Free"
              price="$0"
              billing="forever"
              description="Perfect for individuals exploring anti-Black racism education"
              features={[
                { text: 'Access to 3 introductory courses', included: true },
                { text: 'Basic tribunal case search', included: true },
                { text: 'Community forum access', included: true },
                { text: 'Monthly newsletter', included: true },
                { text: 'Advanced AI-powered search', included: false },
                { text: 'Certificates of completion', included: false },
                { text: 'Analytics dashboard', included: false },
                { text: 'Team management', included: false },
              ]}
              ctaText="Get Started"
              ctaHref="/auth/signup?plan=free"
              popular={false}
            />

            {/* Professional Tier */}
            <PricingCard
              name="Professional"
              price="$49"
              billing="per user/month"
              description="Comprehensive tools for HR professionals and diversity leaders"
              features={[
                { text: 'Access to all 50+ courses', included: true },
                { text: 'Advanced AI-powered case search', included: true },
                { text: 'Certificates of completion', included: true },
                { text: 'Personal analytics dashboard', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Downloadable resources', included: true },
                { text: 'Customizable learning paths', included: true },
                { text: 'Team management (up to 25 users)', included: false },
              ]}
              ctaText="Start Free Trial"
              ctaHref="/auth/signup?plan=professional"
              popular={true}
            />

            {/* Enterprise Tier */}
            <PricingCard
              name="Enterprise"
              price="$199"
              billing="per user/month"
              description="Advanced features for large organizations committed to systemic change"
              features={[
                { text: 'Everything in Professional', included: true },
                { text: 'Unlimited team members', included: true },
                { text: 'Custom branded portal', included: true },
                { text: 'Advanced analytics & reporting', included: true },
                { text: 'API access', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Custom course development', included: true },
                { text: 'SLA & priority support', included: true },
              ]}
              ctaText="Contact Sales"
              ctaHref="/contact?plan=enterprise"
              popular={false}
            />
          </div>

          {/* Billing Note */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              All prices in CAD. Annual billing available (save 20%).{' '}
              <a href="/contact" className="text-primary-600 hover:underline">
                Contact us
              </a>{' '}
              for non-profit and educational institution discounts.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-gray-50 py-20">
        <div className="container-custom">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <FAQItem
              question="Can I switch plans at any time?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences in your billing."
            />
            <FAQItem
              question="What happens when my free trial ends?"
              answer="Your 14-day free trial includes full access to Professional features. After the trial, you'll be asked to enter payment information. If you don't upgrade, you'll automatically move to the Free plan."
            />
            <FAQItem
              question="Do you offer discounts for non-profits?"
              answer="Yes! We offer 30% discounts for registered non-profit organizations and educational institutions. Contact our sales team to verify your organization."
            />
            <FAQItem
              question="Is there a minimum commitment?"
              answer="No. All plans are month-to-month with no long-term contracts required. Cancel anytime with no penalties."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) and can set up invoicing for Enterprise customers."
            />
            <FAQItem
              question="How does per-user pricing work?"
              answer="You only pay for active users. Add or remove team members at any time, and your billing will adjust automatically for the next billing cycle."
            />
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute right-1/3 bottom-1/4 h-80 w-80 rounded-full bg-secondary-600 blur-3xl" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Still Have Questions?
            </h2>
            <p className="mb-8 text-lg text-primary-50">
              Our team is here to help you find the perfect plan for your organization.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/contact" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Contact Sales
              </a>
              <a href="/auth/signup" className="btn-secondary border-white text-white hover:bg-white/10">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>    </div>
  )
}

// Supporting Components
interface PricingCardProps {
  name: string
  price: string
  billing: string
  description: string
  features: { text: string; included: boolean }[]
  ctaText: string
  ctaHref: string
  popular: boolean
}

function PricingCard({
  name,
  price,
  billing,
  description,
  features,
  ctaText,
  ctaHref,
  popular,
}: PricingCardProps) {
  return (
    <div
      className={`card relative ${
        popular ? 'border-2 border-primary-500 shadow-xl' : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-primary-500 px-4 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{name}</h3>
        <div className="mb-3">
          <span className="text-5xl font-bold text-gray-900">{price}</span>
          <span className="ml-2 text-gray-600">/ {billing}</span>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      <a
        href={ctaHref}
        className={`mb-6 block w-full rounded-lg py-3 text-center font-semibold transition-all ${
          popular
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
        }`}
      >
        {ctaText}
      </a>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            ) : (
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            )}
            <span
              className={feature.included ? 'text-gray-700' : 'text-gray-400'}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="leading-relaxed text-gray-600">{answer}</p>
    </div>
  )
}
