import { Shield, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">      
      <div className="container-custom px-4 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary-100 p-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: November 5, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Introduction</h2>
              <p className="mb-4 text-gray-700">
                ABR Insights (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our platform, services, and website (collectively, the &quot;Services&quot;).
              </p>
              <p className="text-gray-700">
                By accessing or using our Services, you agree to the terms of this Privacy Policy. If you do not 
                agree with our practices, please do not use our Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Information We Collect</h2>
              
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Personal Information You Provide</h3>
              <p className="mb-4 text-gray-700">We collect information that you provide directly to us:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Account information (name, email address, password, organization)</li>
                <li>Profile information (job title, department, professional interests)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communications with us (support requests, feedback, inquiries)</li>
                <li>Course enrollment and completion data</li>
                <li>Quiz responses and assessment results</li>
                <li>Search queries and case bookmarks</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Automatically Collected Information</h3>
              <p className="mb-4 text-gray-700">When you use our Services, we automatically collect:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages viewed, time spent, features used)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data (access times, error reports, referral URLs)</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Information from Third Parties</h3>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Authentication providers (Google, Microsoft)</li>
                <li>Payment processors (Stripe)</li>
                <li>Analytics services (anonymized data only)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              <p className="mb-4 text-gray-700">We use collected information for the following purposes:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li><strong>Provide Services:</strong> Process registrations, deliver courses, track progress, generate certificates</li>
                <li><strong>Personalization:</strong> Recommend relevant courses, customize content, improve user experience</li>
                <li><strong>Communication:</strong> Send updates, notifications, support responses, and educational content</li>
                <li><strong>Analytics:</strong> Analyze usage patterns, improve platform performance, develop new features</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, protect user accounts</li>
                <li><strong>Legal Compliance:</strong> Comply with laws, respond to legal requests, enforce our terms</li>
                <li><strong>Research:</strong> Conduct aggregated research on learning outcomes (anonymized data only)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
              <p className="mb-4 text-gray-700">We do not sell your personal information. We may share information in the following circumstances:</p>
              
              <h3 className="mb-3 text-xl font-semibold text-gray-800">With Your Organization</h3>
              <p className="mb-4 text-gray-700">
                If you are accessing ABR Insights through an organizational account, your employer or organization 
                may have access to course enrollment, completion status, quiz scores, and usage analytics for 
                reporting and compliance purposes.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Service Providers</h3>
              <p className="mb-4 text-gray-700">We share information with trusted third-party service providers who assist us in:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Cloud hosting and infrastructure (Microsoft Azure, Supabase)</li>
                <li>Payment processing (Stripe)</li>
                <li>Email communications (SendGrid)</li>
                <li>Analytics and monitoring (Application Insights)</li>
                <li>AI and machine learning services (Azure OpenAI)</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Legal Requirements</h3>
              <p className="mb-4 text-gray-700">We may disclose information when required by law or to:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Enforce our Terms of Service or other agreements</li>
                <li>Protect the rights, property, or safety of ABR Insights, our users, or the public</li>
                <li>Detect, prevent, or address fraud, security, or technical issues</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Data Retention</h2>
              <p className="mb-4 text-gray-700">
                We retain your personal information for as long as necessary to provide our Services and fulfill 
                the purposes outlined in this Privacy Policy. Specific retention periods include:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li><strong>Account data:</strong> Retained while your account is active, plus 7 years after account closure for legal compliance</li>
                <li><strong>Course completion records:</strong> Retained indefinitely for certificate verification purposes</li>
                <li><strong>Payment records:</strong> Retained for 7 years as required by Canadian tax laws</li>
                <li><strong>Usage logs:</strong> Retained for 90 days, then anonymized for analytics</li>
                <li><strong>Support communications:</strong> Retained for 3 years</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
              <p className="mb-4 text-gray-700">Depending on your location, you may have the following rights:</p>
              
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Canadian Users (PIPEDA)</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for certain uses (may limit service functionality)</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">How to Exercise Your Rights</h3>
              <p className="mb-4 text-gray-700">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@abrinsights.ca" className="text-primary-600 hover:text-primary-700">privacy@abrinsights.ca</a>. 
                We will respond to your request within 30 days. You may also update your account information directly 
                through your profile settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
              <p className="mb-4 text-gray-700">We use cookies and similar technologies to:</p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Remember your preferences and authentication status</li>
                <li>Analyze usage patterns and improve our Services</li>
                <li>Deliver personalized content and recommendations</li>
                <li>Measure the effectiveness of our communications</li>
              </ul>
              <p className="text-gray-700">
                You can control cookies through your browser settings. However, disabling cookies may limit your 
                ability to use certain features of our Services. See our <a href="/cookies" className="text-primary-600 hover:text-primary-700">Cookie Policy</a> for more details.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Data Security</h2>
              <p className="mb-4 text-gray-700">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and penetration testing</li>
                <li>Employee training on data protection and privacy</li>
                <li>Secure data centers with SOC 2 Type II certification</li>
                <li>Incident response procedures and breach notification protocols</li>
              </ul>
              <p className="text-gray-700">
                While we strive to protect your information, no method of transmission or storage is 100% secure. 
                Please use strong passwords and enable two-factor authentication for your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be processed and stored in Canada and other countries where we or our service 
                providers operate. We ensure that international transfers comply with applicable data protection laws 
                through appropriate safeguards such as standard contractual clauses.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Our Services are not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately at <a href="mailto:privacy@abrinsights.ca" className="text-primary-600 hover:text-primary-700">privacy@abrinsights.ca</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
              <p className="mb-4 text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, 
                legal requirements, or other factors. We will notify you of material changes by:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Posting the updated policy on our website</li>
                <li>Updating the &quot;Last updated&quot; date at the top of this page</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of our Services after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="rounded-lg bg-gray-50 p-6">
                <div className="mb-4 flex items-start gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:privacy@abrinsights.ca" className="text-primary-600 hover:text-primary-700">
                      privacy@abrinsights.ca
                    </a>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-semibold text-gray-900">Mailing Address</p>
                  <p className="text-gray-700">
                    ABR Insights<br />
                    Privacy Officer<br />
                    123 Bay Street, Suite 1500<br />
                    Toronto, ON M5H 2Y4<br />
                    Canada
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">+1 (416) 555-0123</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>    </div>
  )
}
