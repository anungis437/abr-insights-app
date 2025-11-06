import { Poppins } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'ABR Insights | Anti-Black Racism Training & Resources',
  description:
    'Comprehensive anti-Black racism training platform with tribunal case explorer and bilingual learning resources for Canadian professionals.',
  keywords: [
    'anti-black racism',
    'DEI training',
    'human rights',
    'tribunal cases',
    'workplace equity',
  ],
  authors: [{ name: 'ABR Insights Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    alternateLocale: ['fr_CA'],
    url: 'https://abrinsights.ca',
    siteName: 'ABR Insights',
    title: 'ABR Insights | Anti-Black Racism Training & Resources',
    description: 'Comprehensive anti-Black racism training platform',
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
      <body className="font-sans">{children}</body>
    </html>
  )
}
