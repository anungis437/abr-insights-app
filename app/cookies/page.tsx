import { Cookie, Settings, Shield } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom px-4 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary-100 p-4">
                <Cookie className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Cookie Policy</h1>
            <p className="text-lg text-gray-600">Last updated: November 5, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">What Are Cookies?</h2>
              <p className="mb-4 text-gray-700">
                Cookies are small text files that are placed on your device when you visit a
                website. They are widely used to make websites work more efficiently, provide a
                better user experience, and provide information to website owners.
              </p>
              <p className="text-gray-700">
                ABR Insights uses cookies and similar technologies (such as web beacons, pixels, and
                local storage) to recognize you, remember your preferences, and provide you with a
                personalized experience.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>

              <div className="mb-8 rounded-lg border-2 border-green-200 bg-green-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-green-900">
                  Strictly Necessary Cookies
                </h3>
                <p className="mb-3 text-sm text-green-800">
                  These cookies are essential for the website to function and cannot be disabled.
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-green-800">
                  <li>
                    <strong>Authentication cookies:</strong> Keep you logged in and maintain your
                    session
                  </li>
                  <li>
                    <strong>Security cookies:</strong> Enable security features and protect against
                    fraud
                  </li>
                  <li>
                    <strong>Load balancing:</strong> Distribute traffic across servers for
                    performance
                  </li>
                </ul>
                <p className="mt-3 text-xs font-medium text-green-900">
                  Duration: Session or up to 30 days
                </p>
              </div>

              <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-blue-900">Functionality Cookies</h3>
                <p className="mb-3 text-sm text-blue-800">
                  These cookies enable enhanced functionality and personalization.
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-blue-800">
                  <li>
                    <strong>Preference cookies:</strong> Remember your language, timezone, and
                    display preferences
                  </li>
                  <li>
                    <strong>Progress tracking:</strong> Save your course progress and bookmarks
                  </li>
                  <li>
                    <strong>Form data:</strong> Remember previously entered information
                  </li>
                  <li>
                    <strong>Video player settings:</strong> Remember playback speed and caption
                    preferences
                  </li>
                </ul>
                <p className="mt-3 text-xs font-medium text-blue-900">Duration: Up to 1 year</p>
              </div>

              <div className="mb-8 rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-purple-900">Analytics Cookies</h3>
                <p className="mb-3 text-sm text-purple-800">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-purple-800">
                  <li>
                    <strong>Usage analytics:</strong> Track pages visited, time spent, and features
                    used
                  </li>
                  <li>
                    <strong>Performance monitoring:</strong> Measure page load times and technical
                    issues
                  </li>
                  <li>
                    <strong>A/B testing:</strong> Test different versions of features to improve
                    user experience
                  </li>
                  <li>
                    <strong>Conversion tracking:</strong> Measure signup and subscription completion
                    rates
                  </li>
                </ul>
                <p className="mt-3 text-xs font-medium text-purple-900">
                  Duration: Up to 2 years | Provider: Azure Application Insights
                </p>
              </div>

              <div className="mb-8 rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-orange-900">Marketing Cookies</h3>
                <p className="mb-3 text-sm text-orange-800">
                  These cookies track your browsing habits to deliver relevant advertising (opt-in
                  required).
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-orange-800">
                  <li>
                    <strong>Advertising cookies:</strong> Track effectiveness of marketing campaigns
                  </li>
                  <li>
                    <strong>Retargeting:</strong> Show relevant ads based on pages you&apos;ve
                    visited
                  </li>
                  <li>
                    <strong>Social media:</strong> Enable sharing content to social platforms
                  </li>
                </ul>
                <p className="mt-3 text-xs font-medium text-orange-900">
                  Duration: Up to 1 year | Providers: LinkedIn, Google Ads
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Cookie Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Purpose
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Duration
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">sb-auth-token</td>
                      <td className="border border-gray-300 px-4 py-2">
                        User authentication and session management
                      </td>
                      <td className="border border-gray-300 px-4 py-2">7 days</td>
                      <td className="border border-gray-300 px-4 py-2">Necessary</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">csrf-token</td>
                      <td className="border border-gray-300 px-4 py-2">
                        Cross-site request forgery protection
                      </td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                      <td className="border border-gray-300 px-4 py-2">Necessary</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        user-preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Language, timezone, theme preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Functional</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">
                        course-progress
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Track lesson completion and bookmarks
                      </td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Functional</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">_ga</td>
                      <td className="border border-gray-300 px-4 py-2">
                        Google Analytics - distinguish users
                      </td>
                      <td className="border border-gray-300 px-4 py-2">2 years</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">ai-session</td>
                      <td className="border border-gray-300 px-4 py-2">
                        Application Insights session tracking
                      </td>
                      <td className="border border-gray-300 px-4 py-2">30 minutes</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">cookie-consent</td>
                      <td className="border border-gray-300 px-4 py-2">
                        Remember your cookie preferences
                      </td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Necessary</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Managing Your Cookie Preferences
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Cookie Consent Banner</h3>
              <p className="mb-4 text-gray-700">
                When you first visit ABR Insights, you&apos;ll see a cookie consent banner. You can
                choose to:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Accept All:</strong> Allow all cookies for optimal functionality and
                  personalization
                </li>
                <li>
                  <strong>Reject Non-Essential:</strong> Only use strictly necessary cookies (may
                  limit functionality)
                </li>
                <li>
                  <strong>Customize:</strong> Choose which categories of cookies to allow
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Browser Settings</h3>
              <p className="mb-4 text-gray-700">
                You can also control cookies through your browser settings. Most browsers allow you
                to:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies only</li>
                <li>Clear cookies when you close your browser</li>
                <li>Make exceptions for specific websites</li>
              </ul>

              <p className="mb-4 text-gray-700">Browser-specific instructions:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Impact of Disabling Cookies</h2>
              <p className="mb-4 text-gray-700">
                If you disable cookies, some features of ABR Insights may not function properly:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>You will need to log in every time you visit</li>
                <li>Your course progress may not be saved</li>
                <li>Language and display preferences will reset</li>
                <li>Some interactive features may be unavailable</li>
                <li>We cannot provide personalized recommendations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
              <p className="mb-4 text-gray-700">
                Some cookies on our website are placed by third-party services we use:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Supabase:</strong> Authentication and database services
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing
                </li>
                <li>
                  <strong>Azure Application Insights:</strong> Performance monitoring and analytics
                </li>
                <li>
                  <strong>SendGrid:</strong> Email delivery tracking
                </li>
              </ul>
              <p className="text-gray-700">
                These third parties have their own privacy policies and cookie policies. We
                recommend reviewing their policies for detailed information about their cookie
                practices.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Do Not Track Signals</h2>
              <p className="text-gray-700">
                Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals websites
                you do not want to be tracked. Currently, there is no industry standard for how to
                respond to DNT signals. ABR Insights does not currently respond to DNT browser
                signals, but you can control cookies through our consent banner and your browser
                settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy to reflect changes in our practices or for legal,
                operational, or regulatory reasons. We will notify you of significant changes by
                updating the &quot;Last updated&quot; date and, if necessary, displaying a prominent
                notice on our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have questions about our use of cookies, please contact:
              </p>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="mb-2 font-semibold text-gray-900">Data Protection Officer</p>
                <p className="mb-4 text-gray-700">
                  ABR Insights
                  <br />
                  123 Bay Street, Suite 1500
                  <br />
                  Toronto, ON M5H 2Y4
                  <br />
                  Canada
                </p>
                <p className="mb-1 font-semibold text-gray-900">Email</p>
                <a
                  href="mailto:privacy@abrinsights.ca"
                  className="text-primary-600 hover:text-primary-700"
                >
                  privacy@abrinsights.ca
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>{' '}
    </div>
  )
}
