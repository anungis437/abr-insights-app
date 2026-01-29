import { Shield, Lock, Eye, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

export default function SecurityPage() {
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
              Security & Data Protection
            </h1>
            <p className="text-lg text-gray-600">Your data security is our top priority</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Security Commitment</h2>
              <p className="mb-4 text-gray-700">
                At ABR Insights, we implement industry-leading security practices to protect your
                data. Our comprehensive security program encompasses technical, administrative, and
                physical safeguards designed to prevent unauthorized access, disclosure, alteration,
                or destruction of your information.
              </p>
              <p className="text-gray-700">
                We maintain compliance with relevant security standards and undergo regular
                third-party security audits to ensure our practices meet or exceed industry
                benchmarks.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Security Measures</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                  <Lock className="mb-3 h-8 w-8 text-blue-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Data Encryption</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>In Transit:</strong> TLS 1.3 encryption for all data transmission
                    </li>
                    <li>
                      <strong>At Rest:</strong> AES-256 encryption for stored data
                    </li>
                    <li>
                      <strong>Backups:</strong> Encrypted backups with separate encryption keys
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
                  <Eye className="mb-3 h-8 w-8 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Access Controls</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>MFA:</strong> Multi-factor authentication for all accounts
                    </li>
                    <li>
                      <strong>RBAC:</strong> Role-based access control with principle of least
                      privilege
                    </li>
                    <li>
                      <strong>SSO:</strong> Enterprise single sign-on integration available
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
                  <Shield className="mb-3 h-8 w-8 text-purple-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Infrastructure Security
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>Cloud Provider:</strong> Microsoft Azure with SOC 2 Type II
                      certification
                    </li>
                    <li>
                      <strong>DDoS Protection:</strong> Azure DDoS Protection Standard
                    </li>
                    <li>
                      <strong>Firewalls:</strong> Network segmentation and WAF protection
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
                  <AlertTriangle className="mb-3 h-8 w-8 text-orange-600" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Threat Detection</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>
                      <strong>SIEM:</strong> 24/7 security monitoring and alerting
                    </li>
                    <li>
                      <strong>Intrusion Detection:</strong> Real-time threat detection systems
                    </li>
                    <li>
                      <strong>Vulnerability Scanning:</strong> Weekly automated security scans
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Application Security</h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Secure Development Lifecycle
              </h3>
              <p className="mb-4 text-gray-700">
                Our development process incorporates security at every stage:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Code Review:</strong> All code changes undergo peer review before
                  deployment
                </li>
                <li>
                  <strong>Static Analysis:</strong> Automated security scanning with Snyk and
                  SonarQube
                </li>
                <li>
                  <strong>Dependency Management:</strong> Regular updates and vulnerability
                  monitoring
                </li>
                <li>
                  <strong>Penetration Testing:</strong> Annual third-party penetration testing
                </li>
                <li>
                  <strong>Security Training:</strong> Mandatory security awareness training for all
                  developers
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Authentication & Session Management
              </h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Secure password hashing using Argon2id</li>
                <li>Password complexity requirements enforced</li>
                <li>Account lockout after failed login attempts</li>
                <li>Session timeout after 30 minutes of inactivity</li>
                <li>Secure token-based authentication (JWT)</li>
                <li>Protection against session fixation and hijacking</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Protection Against Common Threats
              </h3>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>SQL Injection:</strong> Parameterized queries and ORM usage
                </li>
                <li>
                  <strong>XSS:</strong> Input validation and output encoding
                </li>
                <li>
                  <strong>CSRF:</strong> Token-based CSRF protection on all state-changing
                  operations
                </li>
                <li>
                  <strong>Clickjacking:</strong> X-Frame-Options headers
                </li>
                <li>
                  <strong>Rate Limiting:</strong> API rate limits to prevent abuse
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Data Privacy & Protection</h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Data Minimization</h3>
              <p className="mb-4 text-gray-700">
                We collect only the data necessary to provide our Services. Personal information is
                not shared with third parties except as required to deliver the Services or as
                required by law.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Data Isolation</h3>
              <p className="mb-4 text-gray-700">
                Customer data is logically isolated using Row Level Security (RLS) policies in our
                database. Multi-tenant architecture ensures data cannot be accessed across
                organizational boundaries.
              </p>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Data Residency</h3>
              <p className="mb-4 text-gray-700">
                All customer data is stored in Canadian data centers (Azure Canada Central and
                Canada East regions). Data does not leave Canada except:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>When using third-party services with appropriate data processing agreements</li>
                <li>For disaster recovery to geographically separated backup locations</li>
                <li>When required by law or with explicit customer consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Business Continuity & Disaster Recovery
              </h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Backups</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Frequency:</strong> Automated daily backups with point-in-time recovery
                </li>
                <li>
                  <strong>Retention:</strong> 30-day backup retention for production data
                </li>
                <li>
                  <strong>Testing:</strong> Quarterly backup restoration tests
                </li>
                <li>
                  <strong>Encryption:</strong> All backups encrypted with separate keys
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">High Availability</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>99.9% uptime SLA for paid plans</li>
                <li>Multi-zone deployment for redundancy</li>
                <li>Automated failover to backup systems</li>
                <li>Load balancing across multiple servers</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Incident Response</h3>
              <p className="mb-4 text-gray-700">
                We maintain a comprehensive incident response plan with defined procedures for
                detecting, responding to, and recovering from security incidents. Our team is
                available 24/7 to respond to critical security events.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Compliance & Certifications</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <CheckCircle className="mb-2 h-5 w-5 text-green-600" />
                  <h4 className="mb-1 font-semibold text-gray-900">PIPEDA</h4>
                  <p className="text-sm text-gray-700">
                    Compliant with Personal Information Protection and Electronic Documents Act
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <CheckCircle className="mb-2 h-5 w-5 text-green-600" />
                  <h4 className="mb-1 font-semibold text-gray-900">SOC 2 Type II</h4>
                  <p className="text-sm text-gray-700">
                    Infrastructure hosted on SOC 2 Type II certified cloud services
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <CheckCircle className="mb-2 h-5 w-5 text-green-600" />
                  <h4 className="mb-1 font-semibold text-gray-900">AODA</h4>
                  <p className="text-sm text-gray-700">
                    Accessibility for Ontarians with Disabilities Act compliance
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <CheckCircle className="mb-2 h-5 w-5 text-green-600" />
                  <h4 className="mb-1 font-semibold text-gray-900">PCI DSS</h4>
                  <p className="text-sm text-gray-700">
                    Payment processing through PCI DSS compliant provider (Stripe)
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Employee Access & Training</h2>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Access Controls</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Background checks for all employees with access to customer data</li>
                <li>Signed confidentiality and data protection agreements</li>
                <li>
                  Principle of least privilege - access granted only as needed for job function
                </li>
                <li>Access reviews conducted quarterly</li>
                <li>Immediate access revocation upon employee termination</li>
              </ul>

              <h3 className="mb-3 text-xl font-semibold text-gray-800">Security Training</h3>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Mandatory security awareness training for all employees</li>
                <li>Specialized training for engineering and operations staff</li>
                <li>Annual refresher courses on data protection and privacy</li>
                <li>Regular phishing simulation exercises</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Vulnerability Disclosure Program
              </h2>
              <p className="mb-4 text-gray-700">
                We welcome responsible disclosure of security vulnerabilities. If you discover a
                security issue, please report it to us:
              </p>
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">How to Report</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Email:{' '}
                  <a
                    href="mailto:security@abrinsights.ca"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    security@abrinsights.ca
                  </a>
                </p>
                <p className="mb-4 text-sm text-gray-700">
                  Please include detailed steps to reproduce the issue and any relevant screenshots
                  or proof of concept.
                </p>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Our Commitment</h3>
                <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
                  <li>Acknowledgment within 24 hours</li>
                  <li>Initial assessment within 72 hours</li>
                  <li>Regular updates on remediation progress</li>
                  <li>Credit in our security hall of fame (with your permission)</li>
                  <li>No legal action for good-faith security research</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Security Breach Notification
              </h2>
              <p className="mb-4 text-gray-700">
                In the unlikely event of a data breach that poses a risk to your personal
                information:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>We will notify affected users within 72 hours of discovering the breach</li>
                <li>
                  Notification will include the nature of the breach, affected data, and remediation
                  steps
                </li>
                <li>
                  We will report the breach to relevant regulatory authorities as required by law
                </li>
                <li>
                  We will provide guidance on how to protect yourself from potential consequences
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Third-Party Security</h2>
              <p className="mb-4 text-gray-700">
                We carefully vet all third-party service providers that process customer data:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Due diligence assessments before vendor selection</li>
                <li>Data Processing Agreements (DPAs) with all vendors</li>
                <li>Regular vendor security reviews</li>
                <li>Limitation of data sharing to minimum necessary</li>
              </ul>
              <p className="mt-4 text-gray-700">
                Key third-party services: Microsoft Azure (hosting), Supabase (database), Stripe
                (payments), SendGrid (email), Azure OpenAI (AI features).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Security Team</h2>
              <p className="mb-4 text-gray-700">
                For security inquiries, vulnerability reports, or to request security documentation:
              </p>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="mb-2 font-semibold text-gray-900">Security Team</p>
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
                <p className="mb-3 text-gray-700">
                  <a
                    href="mailto:security@abrinsights.ca"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    security@abrinsights.ca
                  </a>
                </p>
                <p className="text-xs text-gray-600">
                  For general support inquiries, please use{' '}
                  <a href="/contact" className="text-primary-600 hover:text-primary-700">
                    our contact form
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
