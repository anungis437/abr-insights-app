import { FileText, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom px-4 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary-100 p-4">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Terms of Service</h1>
            <p className="text-lg text-gray-600">Last updated: November 5, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Agreement to Terms</h2>
              <p className="mb-4 text-gray-700">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement
                between you and ABR Insights (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot;
                or &quot;us&quot;) regarding your access to and use of the ABR Insights platform,
                website, courses, case database, and related services (collectively, the
                &quot;Services&quot;).
              </p>
              <p className="text-gray-700">
                By accessing or using our Services, you agree to be bound by these Terms and our
                Privacy Policy. If you do not agree to these Terms, you may not access or use the
                Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Eligibility</h2>
              <p className="mb-4 text-gray-700">
                You must be at least 18 years old to use our Services. By using the Services, you
                represent and warrant that:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>You will provide accurate and complete registration information</li>
                <li>You will not use the Services for any unlawful purpose</li>
                <li>You comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Account Registration and Security
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Account Creation</h3>
              <p className="mb-4 text-gray-700">
                To access certain features, you must create an account. You agree to provide
                accurate, current, and complete information during registration and to update such
                information to keep it accurate and current.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Account Security</h3>
              <p className="mb-4 text-gray-700">You are responsible for:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Maintaining the confidentiality of your password and account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breaches</li>
                <li>Ensuring you log out at the end of each session</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Account Suspension</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if we suspect fraudulent
                activity, violation of these Terms, or misuse of the Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Subscription Plans and Billing
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Subscription Tiers</h3>
              <p className="mb-4 text-gray-700">We offer multiple subscription tiers:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Free Tier:</strong> Limited access to select courses and case search
                  features
                </li>
                <li>
                  <strong>Professional Tier:</strong> Full access to all courses, AI-powered search,
                  and analytics (billed monthly or annually)
                </li>
                <li>
                  <strong>Enterprise Tier:</strong> Custom pricing with team management, advanced
                  analytics, and dedicated support
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Payment Terms</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are in Canadian dollars (CAD) unless otherwise specified</li>
                <li>Payment is processed securely through Stripe</li>
                <li>Prices are subject to change with 30 days notice to existing subscribers</li>
                <li>Taxes (GST/HST/PST) will be added where applicable</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Cancellation and Refunds</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>No refunds for partial months or unused portions of annual subscriptions</li>
                <li>
                  30-day money-back guarantee for first-time annual subscriptions (within first 30
                  days)
                </li>
                <li>
                  Enterprise contracts are subject to specific cancellation terms in the agreement
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Failed Payments</h3>
              <p className="text-gray-700">
                If payment fails, we will attempt to charge your payment method up to three times.
                If payment remains unsuccessful, your account may be downgraded to the Free tier and
                access to paid features will be suspended until payment is resolved.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Acceptable Use Policy</h2>
              <p className="mb-4 text-gray-700">You agree not to:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Use the Services for any illegal purpose or in violation of any laws</li>
                <li>
                  Share your account credentials with others or allow multiple users to access a
                  single account
                </li>
                <li>Scrape, crawl, or use automated tools to extract content from the platform</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Services</li>
                <li>Upload or transmit viruses, malware, or malicious code</li>
                <li>Interfere with or disrupt the operation of the Services</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Harass, threaten, or abuse other users or our staff</li>
                <li>Redistribute, resell, or republish course content without authorization</li>
                <li>Use the Services to train competing AI models or develop competing products</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Intellectual Property Rights
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Our Content</h3>
              <p className="mb-4 text-gray-700">
                All content on the Services, including courses, case analyses, software, text,
                graphics, logos, images, and data compilations, is owned by ABR Insights or its
                licensors and is protected by Canadian and international copyright, trademark, and
                other intellectual property laws.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">License Grant</h3>
              <p className="mb-4 text-gray-700">
                We grant you a limited, non-exclusive, non-transferable, revocable license to access
                and use the Services for your personal or internal business use, subject to these
                Terms.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Tribunal Decisions</h3>
              <p className="mb-4 text-gray-700">
                Tribunal decisions are public domain materials. Our value-added content (AI
                analysis, classifications, summaries, and organizational structure) is proprietary
                and protected by intellectual property rights.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">User Content</h3>
              <p className="text-gray-700">
                You retain ownership of any content you submit (e.g., comments, feedback). By
                submitting content, you grant us a worldwide, non-exclusive, royalty-free license to
                use, reproduce, modify, and display such content in connection with operating and
                improving the Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Disclaimers and Limitations</h2>

              <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">Important Legal Notice</h3>
                </div>
                <p className="text-sm text-yellow-800">
                  ABR Insights provides educational content and case analysis tools. We do not
                  provide legal advice. Nothing on this platform constitutes legal advice or creates
                  an attorney-client relationship. For legal advice specific to your situation,
                  consult a qualified lawyer.
                </p>
              </div>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Service &quot;As Is&quot;
              </h3>
              <p className="mb-4 text-gray-700">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
                NON-INFRINGEMENT.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">No Guarantee of Accuracy</h3>
              <p className="mb-4 text-gray-700">
                While we strive for accuracy, we do not warrant that:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>The Services will be error-free or uninterrupted</li>
                <li>All content is accurate, complete, or current</li>
                <li>AI-generated analysis is free from errors or omissions</li>
                <li>Course completion will result in specific professional outcomes</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Limitation of Liability</h3>
              <p className="text-gray-700">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ABR INSIGHTS AND ITS AFFILIATES, OFFICERS,
                DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR
                GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES, EVEN IF WE HAVE
                BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless ABR Insights and its affiliates
                from any claims, liabilities, damages, losses, and expenses (including legal fees)
                arising out of or related to: (a) your violation of these Terms, (b) your use of the
                Services, (c) your content, or (d) your violation of any rights of another party.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Termination</h2>
              <p className="mb-4 text-gray-700">
                We may terminate or suspend your access to the Services immediately, without prior
                notice or liability, for any reason, including:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
                <li>Prolonged inactivity (Free tier accounts after 12 months)</li>
              </ul>
              <p className="text-gray-700">
                Upon termination, your right to use the Services will cease immediately. Provisions
                that by their nature should survive termination (including intellectual property
                rights, disclaimers, and limitations of liability) will survive.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Governing Law and Dispute Resolution
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Governing Law</h3>
              <p className="mb-4 text-gray-700">
                These Terms are governed by the laws of the Province of Ontario and the federal laws
                of Canada applicable therein, without regard to conflict of law principles.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Dispute Resolution</h3>
              <p className="mb-4 text-gray-700">
                Before initiating litigation, you agree to first contact us at{' '}
                <a
                  href="mailto:legal@abrinsights.ca"
                  className="text-primary-600 hover:text-primary-700"
                >
                  legal@abrinsights.ca
                </a>{' '}
                to attempt to resolve the dispute informally. If the dispute cannot be resolved
                within 60 days:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  For disputes under $25,000 CAD: Binding arbitration in Toronto, Ontario under the
                  Arbitration Act, 1991 (Ontario)
                </li>
                <li>For disputes over $25,000 CAD: Litigation in the courts of Toronto, Ontario</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to These Terms</h2>
              <p className="mb-4 text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify you of
                material changes by:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Posting the updated Terms on our website</li>
                <li>Updating the &quot;Last updated&quot; date</li>
                <li>Sending email notification to registered users</li>
                <li>Requiring acceptance of new Terms upon next login (for material changes)</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of the Services after changes become effective constitutes
                acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Miscellaneous</h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Entire Agreement</h3>
              <p className="mb-4 text-gray-700">
                These Terms, together with our Privacy Policy and any additional terms specific to
                certain features, constitute the entire agreement between you and ABR Insights.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Severability</h3>
              <p className="mb-4 text-gray-700">
                If any provision of these Terms is found unenforceable, the remaining provisions
                will continue in full force and effect.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Waiver</h3>
              <p className="mb-4 text-gray-700">
                Our failure to enforce any right or provision of these Terms will not constitute a
                waiver of such right or provision.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Assignment</h3>
              <p className="text-gray-700">
                You may not assign or transfer these Terms without our prior written consent. We may
                assign these Terms without restriction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mb-4 text-gray-700">For questions about these Terms, please contact:</p>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="mb-2 font-semibold text-gray-900">ABR Insights</p>
                <p className="text-gray-700">
                  Legal Department
                  <br />
                  123 Bay Street, Suite 1500
                  <br />
                  Toronto, ON M5H 2Y4
                  <br />
                  Canada
                  <br />
                  <a
                    href="mailto:legal@abrinsights.ca"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    legal@abrinsights.ca
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>{' '}
    </div>
  )
}
