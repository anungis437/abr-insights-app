export type FooterLink = {
  label: string
  href: string
  external?: boolean
}

export type FooterSection = {
  title: string
  links: FooterLink[]
}

export type FooterConfig = {
  public: FooterSection[]
  authenticated: FooterSection[]
}

// Public footer - Marketing focused
const publicFooterSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Cases', href: '/cases' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Team Management', href: '/team' },
      { label: 'Pricing', href: '/pricing' },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Resources', href: '/resources' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
    ]
  }
]

// Authenticated footer - User focused
const authenticatedFooterSections: FooterSection[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Learning', href: '/training' },
      { label: 'Browse Cases', href: '/cases/browse' },
      { label: 'Profile', href: '/profile' },
      { label: 'Settings', href: '/profile/settings' },
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Support', href: '/contact' },
      { label: 'Feedback', href: '/feedback' },
      { label: 'FAQ', href: '/faq' },
      { label: 'API Docs', href: '/docs/api', external: true },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
    ]
  }
]

export const footerConfig: FooterConfig = {
  public: publicFooterSections,
  authenticated: authenticatedFooterSections
}

/**
 * Get footer sections based on authentication state
 */
export function getFooterSections(isAuthenticated: boolean): FooterSection[] {
  return isAuthenticated ? footerConfig.authenticated : footerConfig.public
}
