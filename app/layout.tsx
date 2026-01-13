import { Poppins } from 'next/font/google'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'
import NavigationWrapper from '@/components/shared/navigation/NavigationWrapper'
import FooterWrapper from '@/components/shared/footer/FooterWrapper'
import SidebarWrapper from '@/components/shared/sidebar/SidebarWrapper'
import { PWAProvider } from '@/components/shared/PWAComponents'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0070f3' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'ABR Insights | Anti-Black Racism Training & Resources',
    template: '%s | ABR Insights',
  },
  description:
    'Comprehensive anti-Black racism training platform with tribunal case explorer, expert-led courses, and workplace equity resources for Canadian professionals.',
  keywords: [
    'anti-black racism',
    'DEI training',
    'EDI consulting',
    'human rights',
    'tribunal cases',
    'workplace equity',
    'diversity training',
    'inclusive leadership',
  ],
  authors: [{ name: 'ABR Insights Team' }],
  metadataBase: new URL('https://abrinsights.ca'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ABR Insights',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    alternateLocale: ['fr_CA'],
    url: 'https://abrinsights.ca',
    siteName: 'ABR Insights',
    title: 'ABR Insights | Anti-Black Racism Training & Resources',
    description: 'Comprehensive anti-Black racism training platform with tribunal cases, expert courses, and workplace equity tools.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ABR Insights Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABR Insights | Anti-Black Racism Training & Resources',
    description: 'Comprehensive anti-Black racism training platform',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans">
        <AuthProvider>
          <LanguageProvider>
            <PWAProvider>
              <NavigationWrapper />
              <SidebarWrapper />
              <main className="min-h-screen pt-16 lg:pl-64">{children}</main>
              <FooterWrapper />
            </PWAProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
