import { Eye, CheckCircle, Users, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom px-4 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary-100 p-4">
                <Eye className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Accessibility Commitment
            </h1>
            <p className="text-lg text-gray-600">Last updated: November 5, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Commitment</h2>
              <p className="mb-4 text-gray-700">
                ABR Insights is committed to ensuring digital accessibility for people with
                disabilities. We are continually improving the user experience for everyone and
                applying the relevant accessibility standards to achieve these goals.
              </p>
              <p className="text-gray-700">
                We strive to conform to Level AA of the Web Content Accessibility Guidelines (WCAG)
                2.1 and to comply with the Accessibility for Ontarians with Disabilities Act (AODA)
                and the Accessible Canada Act.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Accessibility Features</h2>
              <p className="mb-4 text-gray-700">
                Our platform includes the following accessibility features:
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Keyboard Navigation</h3>
                  <p className="text-sm text-gray-700">
                    Full keyboard accessibility for all interactive elements, including courses,
                    navigation, and forms.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Screen Reader Support
                  </h3>
                  <p className="text-sm text-gray-700">
                    Compatible with JAWS, NVDA, VoiceOver, and other assistive technologies with
                    proper ARIA labels.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Text Alternatives</h3>
                  <p className="text-sm text-gray-700">
                    Alternative text for all images, icons, and non-text content. Transcripts for
                    video content.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Color Contrast</h3>
                  <p className="text-sm text-gray-700">
                    High contrast ratios (minimum 4.5:1) between text and backgrounds for
                    readability.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Resizable Text</h3>
                  <p className="text-sm text-gray-700">
                    Text can be resized up to 200% without loss of functionality or content.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <CheckCircle className="mb-3 h-6 w-6 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Captions & Subtitles</h3>
                  <p className="text-sm text-gray-700">
                    Closed captions for all video content and audio descriptions where appropriate.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Standards and Compliance</h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">WCAG 2.1 Level AA</h3>
              <p className="mb-4 text-gray-700">
                We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level
                AA success criteria, which include:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Perceivable:</strong> Information and UI components must be presentable to
                  users in ways they can perceive
                </li>
                <li>
                  <strong>Operable:</strong> UI components and navigation must be operable by all
                  users
                </li>
                <li>
                  <strong>Understandable:</strong> Information and operation of the UI must be
                  understandable
                </li>
                <li>
                  <strong>Robust:</strong> Content must be robust enough to work with current and
                  future technologies
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">AODA Compliance</h3>
              <p className="mb-4 text-gray-700">
                We comply with the Accessibility for Ontarians with Disabilities Act (AODA),
                including:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Information and Communications Standard</li>
                <li>Employment Standard (for our hiring practices)</li>
                <li>Customer Service Standard</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Accessible Canada Act</h3>
              <p className="text-gray-700">
                As a federally regulated entity providing services across Canada, we adhere to the
                requirements of the Accessible Canada Act and regularly update our accessibility
                plan.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Accessible Course Content</h2>
              <p className="mb-4 text-gray-700">
                All educational content on our platform is designed with accessibility in mind:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Course materials available in multiple formats (text, video, audio)</li>
                <li>PDF documents are tagged and readable by screen readers</li>
                <li>Video player controls are keyboard accessible</li>
                <li>Adjustable playback speed for video and audio content</li>
                <li>Downloadable transcripts for all multimedia content</li>
                <li>
                  Quizzes and assessments are accessible and provide adequate time for completion
                </li>
                <li>Interactive elements include appropriate focus indicators and labels</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Assistive Technology Compatibility
              </h2>
              <p className="mb-4 text-gray-700">Our platform has been tested with:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Screen Readers:</strong> JAWS, NVDA (Windows), VoiceOver (macOS/iOS),
                  TalkBack (Android)
                </li>
                <li>
                  <strong>Browsers:</strong> Chrome, Firefox, Safari, Edge (latest versions)
                </li>
                <li>
                  <strong>Operating Systems:</strong> Windows 10/11, macOS, iOS, Android
                </li>
                <li>
                  <strong>Input Methods:</strong> Keyboard-only navigation, voice control, switch
                  devices
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Ongoing Improvements</h2>
              <p className="mb-4 text-gray-700">
                Accessibility is an ongoing commitment. We continuously work to improve
                accessibility through:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Regular accessibility audits by third-party experts</li>
                <li>Automated testing with tools like axe DevTools and WAVE</li>
                <li>Manual testing with assistive technologies</li>
                <li>User testing with people with disabilities</li>
                <li>Staff training on accessibility best practices</li>
                <li>Incorporating accessibility into our development process from the start</li>
                <li>Monitoring emerging standards and technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Accessibility Statement Updates
              </h2>
              <p className="text-gray-700">
                This accessibility statement was last reviewed and updated on November 5, 2025. We
                review and update this statement annually or when significant changes are made to
                our platform or accessibility features.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Request for Accommodations</h2>
              <p className="mb-4 text-gray-700">
                If you require course materials in an alternative format or need specific
                accommodations to access our Services, please contact us. We will work with you to
                provide reasonable accommodations in a timely manner.
              </p>
              <p className="text-gray-700">Common accommodation requests we fulfill include:</p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Extended time for assessments</li>
                <li>Alternative file formats (EPUB, large print PDF, Braille-ready)</li>
                <li>One-on-one support sessions</li>
                <li>Custom keyboard shortcuts</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Feedback and Contact</h2>
              <p className="mb-4 text-gray-700">
                We welcome your feedback on the accessibility of ABR Insights. If you encounter any
                accessibility barriers or have suggestions for improvement, please let us know:
              </p>
              <div className="rounded-lg bg-gray-50 p-6">
                <div className="mb-4">
                  <p className="mb-2 font-semibold text-gray-900">Accessibility Coordinator</p>
                  <p className="text-gray-700">
                    ABR Insights
                    <br />
                    123 Bay Street, Suite 1500
                    <br />
                    Toronto, ON M5H 2Y4
                    <br />
                    Canada
                  </p>
                </div>
                <div className="mb-4">
                  <p className="mb-1 font-semibold text-gray-900">Email</p>
                  <a
                    href="mailto:accessibility@abrinsights.ca"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    accessibility@abrinsights.ca
                  </a>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-700">+1 (416) 555-0123</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                We aim to respond to accessibility feedback within 5 business days and will work
                with you to resolve issues as quickly as possible.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Accessibility Resources</h2>
              <p className="mb-4 text-gray-700">
                For more information about web accessibility and assistive technologies:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <a
                    href="https://www.w3.org/WAI/"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    W3C Web Accessibility Initiative (WAI)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ontario.ca/page/accessibility-laws"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    AODA Information and Resources
                  </a>
                </li>
                <li>
                  <a
                    href="https://accessible.canada.ca/"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Accessible Canada
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.afb.org/"
                    className="text-primary-600 hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    American Foundation for the Blind
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>{' '}
    </div>
  )
}
