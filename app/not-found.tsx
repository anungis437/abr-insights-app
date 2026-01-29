import Link from 'next/link'
import { Home, Search, FileQuestion, Mail } from 'lucide-react'

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default function NotFound() {
  const quickLinks = [
    { href: '/', label: 'Home', icon: Home, description: 'Return to homepage' },
    { href: '/courses', label: 'Courses', icon: Search, description: 'Browse training courses' },
    {
      href: '/cases',
      label: 'Case Explorer',
      icon: FileQuestion,
      description: 'Search case database',
    },
    { href: '/contact', label: 'Contact', icon: Mail, description: 'Get in touch' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-custom flex min-h-screen items-center justify-center py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <h1 className="mb-4 text-9xl font-bold text-gray-200">404</h1>
            <div className="relative mx-auto h-64 w-64">
              {/* Animated circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-primary-400/30 to-secondary-400/30 blur-2xl"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-400/40 blur-xl [animation-delay:0.5s]"></div>
              </div>
              {/* Centered icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white p-8 shadow-xl">
                  <Search className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Page Not Found</h2>
          <p className="mb-8 text-lg text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved,
            deleted, or the URL might be incorrect.
          </p>

          {/* Quick Links */}
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Quick Links
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-primary-50 p-3 transition-colors group-hover:bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-gray-900 group-hover:text-primary-600">
                        {link.label}
                      </h4>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Additional Help */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">Need More Help?</h3>
            <p className="mb-4 text-sm text-gray-600">
              If you believe this is an error or need assistance finding what you&apos;re looking
              for, our support team is here to help.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary flex-1 text-center">
                Contact Support
              </Link>
              <Link href="/faq" className="btn-secondary flex-1 text-center">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
