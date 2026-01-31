'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useEntitlements } from '@/hooks/use-entitlements'
import { PricingCard } from '@/components/shared/PricingCard'

export default function PricingPage() {
  const { entitlements, loading } = useEntitlements()
  const currentTier = entitlements?.tier?.toUpperCase() || 'FREE'
  const [seatCount, setSeatCount] = useState(1)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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
          <div className="absolute bottom-1/3 left-1/3 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container-custom">
          {/* Current Plan Badge */}
          {!loading && currentTier && (
            <div className="mb-8 text-center">
              <p className="text-lg text-gray-600">
                Your current plan:{' '}
                <span className="font-semibold text-primary-600">
                  {currentTier.charAt(0) + currentTier.slice(1).toLowerCase()}
                </span>
              </p>
            </div>
          )}

          {/* Seat Selection for Team Plans */}
          <div className="mb-12 flex items-center justify-center gap-4">
            <Users className="h-5 w-5 text-gray-600" />
            <label htmlFor="seats" className="text-sm font-medium text-gray-700">
              Team size:
            </label>
            <select
              id="seats"
              value={seatCount}
              onChange={(e) => setSeatCount(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value={1}>1 user</option>
              <option value={5}>5 users</option>
              <option value={10}>10 users</option>
              <option value={25}>25 users</option>
              <option value={50}>50 users</option>
              <option value={100}>100 users</option>
            </select>
            <span className="text-sm text-gray-500">(Enterprise: contact for 100+ seats)</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
              tier="FREE"
              popular={false}
            />
            {/* Professional Tier */}
            <PricingCard
              name="Professional"
              price="$49"
              billing={`per user/month × ${seatCount}`}
              description="Comprehensive tools for HR professionals and diversity leaders"
              features={[
                { text: 'Access to all 50+ courses', included: true },
                { text: 'Advanced AI-powered case search', included: true },
                { text: 'Certificates of completion', included: true },
                { text: 'Personal analytics dashboard', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Downloadable resources', included: true },
                { text: 'Customizable learning paths', included: true },
                { text: 'Team management (up to 25 users)', included: true },
              ]}
              ctaText="Start Free Trial"
              tier="PROFESSIONAL"
              popular={true}
              seatCount={seatCount}
            />

            {/* Business Tier */}
            <PricingCard
              name="Business"
              price="$89"
              billing={`per user/month × ${seatCount}`}
              description="Advanced features for growing organizations"
              features={[
                { text: 'Everything in Professional', included: true },
                { text: 'Team management (up to 100 users)', included: true },
                { text: 'Advanced analytics & reporting', included: true },
                { text: 'Custom learning paths', included: true },
                { text: 'API access (basic)', included: true },
                { text: 'Priority support', included: true },
                { text: 'Quarterly business reviews', included: true },
                { text: 'Data exports', included: true },
              ]}
              ctaText="Upgrade to Business"
              tier="BUSINESS"
              popular={false}
              seatCount={seatCount}
            />

            {/* Business Plus Tier */}
            <PricingCard
              name="Business Plus"
              price="$129"
              billing={`per user/month × ${seatCount}`}
              description="Enhanced features for enterprise-ready organizations"
              features={[
                { text: 'Everything in Business', included: true },
                { text: 'Team management (up to 500 users)', included: true },
                { text: 'Advanced SSO & security', included: true },
                { text: 'Custom integrations', included: true },
                { text: 'Dedicated success manager', included: true },
                { text: 'Custom reporting', included: true },
                { text: 'SLA guarantee', included: true },
                { text: 'Advanced API access', included: true },
              ]}
              ctaText="Upgrade to Business Plus"
              tier="BUSINESS_PLUS"
              popular={false}
              seatCount={seatCount}
            />

            {/* Enterprise Tier */}
            <PricingCard
              name="Enterprise"
              price="Custom"
              billing="contact sales"
              description="Advanced features for large organizations committed to systemic change"
              features={[
                { text: 'Everything in Business', included: true },
                { text: 'Unlimited team members', included: true },
                { text: 'Custom branded portal', included: true },
                { text: 'Advanced analytics & reporting', included: true },
                { text: 'Full API access', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Custom course development', included: true },
                { text: 'SLA & 24/7 support', included: true },
              ]}
              ctaText="Contact Sales"
              tier="ENTERPRISE"
              popular={false}
              contactSales={true}
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
              question="How does seat-based pricing work?"
              answer="You purchase a number of seats for your organization, and can assign them to team members. You can add or remove seats at any time, and billing adjusts for the next cycle."
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
          </div>
        </div>

        {/* Decorative Blurs */}
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-5">
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-secondary-600 blur-3xl" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 py-20 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Still Have Questions?</h2>
            <p className="mb-8 text-lg text-primary-50">
              Our team is here to help you find the perfect plan for your organization.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/contact"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Contact Sales
              </a>
              <a
                href="/auth/signup"
                className="btn-secondary border border-white text-white hover:bg-white/10"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Supporting Components
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="leading-relaxed text-gray-600">{answer}</p>
    </div>
  )
}
