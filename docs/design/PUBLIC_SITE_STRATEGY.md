# Public-Facing Site: Visual & Design Strategy

Status: Draft
Last updated: 2025-11-05

## Purpose

This document defines the visual design strategy, asset sourcing, typography, color system, and component guidelines for the ABR Insights public marketing website. The public site serves as the primary entry point for prospects, providing information about features, pricing, and driving conversions to sign-ups.

## Goals

- Create a modern, professional, and accessible public-facing website
- Establish a consistent visual identity that reflects the platform's mission
- Drive conversions through clear messaging and compelling CTAs
- Ensure all visual assets are properly licensed and sourced
- Maintain WCAG 2.1 AA accessibility compliance
- Support bilingual content (English/French) for Canadian market

---

## Typography System

### Primary Font: Poppins

**Font Family**: Poppins (Google Fonts)
**License**: Open Font License (OFL) - Free for commercial use
**Source**: https://fonts.google.com/specimen/Poppins

**Rationale**:

- Modern, geometric sans-serif with excellent readability
- Supports multiple weights for hierarchy
- Excellent screen rendering
- Bilingual support (English/French characters)
- Free and open-source

**Font Weights & Usage**:

```css
/* Global Font Configuration */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --font-family-primary:
    'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

body {
  font-family: var(--font-family-primary);
}
```

**Weight Scale**:

- **300 Light**: Subtle UI elements, captions
- **400 Regular**: Body text, paragraphs, form labels
- **500 Medium**: Buttons, navigation items, emphasis
- **600 SemiBold**: Subheadings, card titles, feature headings
- **700 Bold**: Page headings, hero titles, major CTAs

**Type Scale**:

```css
/* Typography Scale */
--text-xs: 0.75rem; /* 12px - Fine print, labels */
--text-sm: 0.875rem; /* 14px - Secondary text */
--text-base: 1rem; /* 16px - Body text */
--text-lg: 1.125rem; /* 18px - Large body, intro */
--text-xl: 1.25rem; /* 20px - Small headings */
--text-2xl: 1.5rem; /* 24px - Section headings */
--text-3xl: 1.875rem; /* 30px - Page headings */
--text-4xl: 2.25rem; /* 36px - Hero headings */
--text-5xl: 3rem; /* 48px - Large hero */
--text-6xl: 3.75rem; /* 60px - Extra large hero */
```

**Line Height**:

- Body text: 1.6 (26px at 16px base)
- Headings: 1.2
- Large hero text: 1.1

---

## Color System

### Primary Palette

**Brand Colors** (Based on social justice, equity, accessibility themes):

```css
/* Primary Colors */
--color-primary-50: #eff6ff; /* Lightest blue - backgrounds */
--color-primary-100: #dbeafe; /* Very light blue */
--color-primary-200: #bfdbfe; /* Light blue - hover states */
--color-primary-300: #93c5fd; /* Medium light blue */
--color-primary-400: #60a5fa; /* Medium blue */
--color-primary-500: #3b82f6; /* Primary blue - main brand color */
--color-primary-600: #2563eb; /* Dark blue - primary hover */
--color-primary-700: #1d4ed8; /* Darker blue */
--color-primary-800: #1e40af; /* Very dark blue */
--color-primary-900: #1e3a8a; /* Darkest blue */

/* Secondary Colors (Accent) */
--color-secondary-50: #fdf4ff;
--color-secondary-100: #fae8ff;
--color-secondary-200: #f5d0fe;
--color-secondary-300: #f0abfc;
--color-secondary-400: #e879f9;
--color-secondary-500: #d946ef; /* Secondary accent - magenta */
--color-secondary-600: #c026d3;
--color-secondary-700: #a21caf;
--color-secondary-800: #86198f;
--color-secondary-900: #701a75;

/* Success/Error/Warning */
--color-success: #10b981; /* Green - success states */
--color-error: #ef4444; /* Red - errors */
--color-warning: #f59e0b; /* Amber - warnings */
--color-info: #3b82f6; /* Blue - info */

/* Neutral Grays */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### Color Usage Guidelines

- **Primary Blue**: CTAs, links, primary actions, brand elements
- **Secondary Magenta**: Accents, highlights, featured content
- **Success Green**: Completed states, positive messaging
- **Error Red**: Errors, warnings, destructive actions
- **Neutral Grays**: Text, borders, backgrounds, UI chrome

**Accessibility**: All color combinations meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)

---

## Visual Asset Strategy

### Stock Photography Sources (Free & Commercial-Use Approved)

**Primary Sources**:

1. **Unsplash** (https://unsplash.com)
   - License: Unsplash License (Free for commercial use)
   - Focus: High-quality, professional photos
   - Categories to search: diversity, education, workplace, collaboration, justice, learning

2. **Pexels** (https://pexels.com)
   - License: Pexels License (Free for commercial use)
   - Focus: Diverse, inclusive imagery
   - Categories: business, education, diversity, teamwork, professional

3. **Pixabay** (https://pixabay.com)
   - License: Pixabay License (Free for commercial use)
   - Good for: Illustrations, graphics, supplementary images

4. **StockSnap.io** (https://stocksnap.io)
   - License: CC0 Public Domain
   - Focus: Modern, clean imagery

**Image Guidelines**:

- **Diversity & Inclusion**: Prioritize images showing diverse teams, Black professionals, inclusive workplaces
- **Authenticity**: Avoid overly staged corporate stock photos
- **Resolution**: Minimum 1920x1080 for hero images, 800x600 for content images
- **Format**: WebP with JPEG fallback for optimal performance
- **Optimization**: Compress all images (max 200KB for hero, 100KB for content)

**Attribution**: While not legally required, include photo credits in footer or /credits page for transparency

### Iconography

**Primary Icon Library**: Heroicons (https://heroicons.com)

- **License**: MIT License (Free for commercial use)
- **Styles**: Outline (default), Solid (emphasis)
- **Format**: SVG
- **Usage**: Navigation, feature lists, UI elements

**Alternative**: Lucide Icons (https://lucide.dev) - MIT License

### Illustrations

**Primary Source**: unDraw (https://undraw.co)

- **License**: Open-source, free for commercial use
- **Customization**: Recolor to match brand colors
- **Usage**: Hero sections, empty states, feature explanations

**Alternative Sources**:

- **Storyset** (https://storyset.com) - Free with attribution
- **DrawKit** (https://drawkit.com) - Free & paid options
- **Blush** (https://blush.design) - Free & paid collections

---

## Page Structure & Components

### Site Map

```
Public Site (marketing.abrinsights.ca or abrinsights.ca)
├── Home (/)
│   ├── Hero Section
│   ├── Features Overview
│   ├── Social Proof (testimonials)
│   ├── Pricing Tiers
│   └── CTA Section
├── Features (/features)
│   ├── Training & Education
│   ├── Data Explorer
│   ├── AI Coaching
│   └── Analytics
├── Pricing (/pricing)
│   ├── Free Tier
│   ├── Professional Tier
│   └── Enterprise Tier
├── About (/about)
│   ├── Mission & Vision
│   ├── Team
│   └── Impact Stories
├── Resources (/resources)
│   ├── Blog
│   ├── Case Studies
│   └── Documentation
├── Contact (/contact)
└── Legal
    ├── Privacy Policy (/privacy)
    ├── Terms of Service (/terms)
    └── Accessibility Statement (/accessibility)
```

### Component Library

#### 1. Hero Section

**Layout**: Full-width, centered content with background image/gradient

**Components**:

- **Headline**: Display text (text-5xl, font-bold)
- **Subheadline**: Intro text (text-xl, font-regular)
- **CTA Buttons**: Primary + Secondary actions
- **Hero Image**: Right-aligned illustration or photo (unDraw or Unsplash)

**Example**:

```html
<section class="hero bg-gradient-to-br from-primary-50 to-primary-100 py-20">
  <div class="container mx-auto px-6">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <h1 class="mb-6 text-5xl font-bold text-gray-900">
          Empower Your Organization with Anti-Black Racism Insights
        </h1>
        <p class="mb-8 text-xl text-gray-600">
          Comprehensive training, case law analysis, and AI-powered coaching to build more equitable
          workplaces across Canada.
        </p>
        <div class="flex gap-4">
          <button class="btn-primary">Start Free Trial</button>
          <button class="btn-secondary">View Demo</button>
        </div>
      </div>
      <div>
        <img src="/images/hero-illustration.svg" alt="Platform overview" />
      </div>
    </div>
  </div>
</section>
```

#### 2. Feature Cards

**Layout**: Grid (3 columns desktop, 1 column mobile)

**Components**:

- **Icon**: Heroicon (outline, 48px)
- **Title**: Heading (text-2xl, font-semibold)
- **Description**: Body text (text-base)
- **Link**: "Learn more →"

**Styling**:

```css
.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

#### 3. Pricing Cards

**Layout**: Grid (3 columns, equal height)

**Components per card**:

- **Tier Name**: (e.g., "Professional")
- **Price**: Large text with currency (CAD $49/mo)
- **Feature List**: Checkmarks + text
- **CTA Button**: Different styles per tier

**Styling**:

- Free: Border + outline button
- Professional: Elevated shadow + primary button (recommended badge)
- Enterprise: Gradient border + dark button

#### 4. Testimonials/Social Proof

**Layout**: Carousel or static grid

**Components**:

- **Quote**: Text (italic, text-lg)
- **Author Photo**: Circle, 64px (Unsplash)
- **Author Name + Title**: (text-base, font-medium)
- **Organization**: (text-sm, text-gray-600)

#### 5. CTA Section

**Layout**: Full-width, centered, accent background

**Components**:

- **Headline**: (text-4xl, font-bold)
- **Subtext**: (text-xl)
- **Button**: Primary CTA

**Example**:

```html
<section class="cta-section bg-primary-600 py-16 text-white">
  <div class="container mx-auto px-6 text-center">
    <h2 class="mb-4 text-4xl font-bold">Ready to Transform Your Workplace?</h2>
    <p class="mb-8 text-xl">Join 500+ organizations building more equitable futures.</p>
    <button class="btn-white">Get Started Today</button>
  </div>
</section>
```

---

## Component Styling (Tailwind CSS)

### Button Styles

```css
/* Primary Button */
.btn-primary {
  @apply rounded-lg bg-primary-600 px-8 py-3 font-medium text-white 
         transition-all duration-200 hover:bg-primary-700 
         focus:outline-none focus:ring-4 focus:ring-primary-300;
}

/* Secondary Button */
.btn-secondary {
  @apply rounded-lg border-2 border-primary-600 bg-white px-8 py-3 
         font-medium text-primary-600 transition-all 
         duration-200 hover:bg-primary-50 focus:outline-none 
         focus:ring-4 focus:ring-primary-300;
}

/* White Button (for dark backgrounds) */
.btn-white {
  @apply rounded-lg bg-white px-8 py-3 font-medium text-primary-600 
         transition-all duration-200 hover:bg-gray-100 
         focus:outline-none focus:ring-4 focus:ring-white/30;
}
```

### Card Styles

```css
.card {
  @apply rounded-xl bg-white p-6 shadow-md transition-shadow 
         duration-300 hover:shadow-xl;
}

.card-elevated {
  @apply rounded-xl border-2 border-primary-200 bg-white p-8 shadow-lg;
}
```

---

## Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Small devices (tablets) */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* Extra extra large devices */
```

**Mobile-First Approach**:

- Design for mobile (375px) first
- Scale up to tablet (768px)
- Optimize for desktop (1280px+)

---

## Animation & Interaction

### Transitions

```css
/* Default transition */
.transition-base {
  transition: all 0.2s ease-in-out;
}

/* Hover scale */
.hover-scale:hover {
  transform: scale(1.05);
}

/* Fade in on scroll (using Intersection Observer) */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Scroll Animations

**Library**: AOS (Animate On Scroll) - https://michalsnik.github.io/aos/

- **License**: MIT
- **Usage**: Fade-in, slide-in effects for content sections

---

## Performance Optimization

### Image Optimization

```javascript
// Next.js Image Component Configuration
import Image from 'next/image'

;<Image
  src="/images/hero.jpg"
  alt="Description"
  width={1920}
  height={1080}
  priority={true} // For above-fold images
  quality={85} // Balance quality vs size
  placeholder="blur"
/>
```

### Font Loading

```html
<!-- Preconnect to Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Load Poppins with display=swap -->
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### CSS Optimization

- Use Tailwind CSS with PurgeCSS for minimal bundle size
- Inline critical CSS for above-fold content
- Lazy load non-critical styles

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast

All text meets minimum contrast ratios:

- Normal text: 4.5:1
- Large text (18pt+ or 14pt bold+): 3:1
- UI components: 3:1

### Focus States

```css
/* Custom focus ring */
*:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
}

.skip-to-content:focus {
  top: 0;
}
```

### ARIA Labels

- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Provide `aria-label` for icon-only buttons
- Use `alt` text for all images (descriptive, not decorative)
- Ensure keyboard navigation works for all interactive elements

---

## Multilingual Support (EN/FR)

### Language Toggle

```html
<div class="language-toggle">
  <button aria-label="Switch to French" hreflang="fr">FR</button>
  <button aria-label="Switch to English" hreflang="en" class="active">EN</button>
</div>
```

### Content Strategy

- Maintain parallel content files (en.json, fr.json)
- Use i18n library (next-i18next for Next.js)
- Localize dates, numbers, currency (CAD)
- Ensure Poppins supports French characters (é, è, ê, ç, etc.)

---

## Tech Stack Recommendation

### Static Site Generator

**Next.js** (https://nextjs.org)

- Static site generation (SSG) for marketing pages
- Image optimization built-in
- Fast performance
- SEO-friendly

**Alternative**: Astro (https://astro.build) - Ultra-fast, component-agnostic

### Styling

**Tailwind CSS** (https://tailwindcss.com)

- Utility-first CSS framework
- Poppins integration via config
- Responsive design system
- Small bundle size with PurgeCSS

### Hosting

**Azure Static Web Apps**

- Built-in CDN
- Free SSL
- Custom domain support
- GitHub Actions deployment

---

## SEO Optimization

### Meta Tags

```html
<head>
  <title>ABR Insights | Anti-Black Racism Training & Analytics Platform</title>
  <meta
    name="description"
    content="Comprehensive training, case law analysis, and AI-powered coaching for Canadian organizations building equitable workplaces."
  />

  <!-- Open Graph -->
  <meta property="og:title" content="ABR Insights" />
  <meta
    property="og:description"
    content="Empower your organization with anti-Black racism insights"
  />
  <meta property="og:image" content="https://abrinsights.ca/og-image.jpg" />
  <meta property="og:url" content="https://abrinsights.ca" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ABR Insights" />
  <meta name="twitter:description" content="Anti-Black racism training platform" />
  <meta name="twitter:image" content="https://abrinsights.ca/twitter-card.jpg" />
</head>
```

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ABR Insights",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "CAD"
  }
}
```

---

## Asset Organization

### Directory Structure

```
public/
├── images/
│   ├── hero/
│   │   ├── hero-main.webp
│   │   └── hero-main.jpg (fallback)
│   ├── features/
│   │   ├── training.svg
│   │   ├── analytics.svg
│   │   └── coaching.svg
│   ├── team/
│   │   └── (team member photos)
│   ├── testimonials/
│   │   └── (client photos - with permission)
│   └── illustrations/
│       └── (unDraw SVGs)
├── fonts/
│   └── (if self-hosting Poppins)
└── icons/
    └── (Heroicons SVGs)
```

---

## Brand Voice & Messaging

### Tone

- **Professional but Approachable**: Authoritative without being academic
- **Empowering**: Focus on positive change and impact
- **Inclusive**: Use "we" and "together"
- **Action-Oriented**: Strong CTAs and clear value propositions

### Key Messages

- "Transform workplaces through education and data-driven insights"
- "Comprehensive anti-Black racism training built for Canadian organizations"
- "AI-powered coaching meets expert-curated case law"
- "Join 500+ organizations building more equitable futures"

### Avoid

- Overly corporate jargon
- Passive voice
- Generic stock phrases ("synergy", "leverage", "best-in-class")
- Making promises without evidence

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- Set up Next.js project with Tailwind CSS
- Configure Poppins font (Google Fonts)
- Define color system and CSS variables
- Create base component library (buttons, cards, forms)
- Source and optimize hero images (Unsplash)

### Phase 2: Core Pages (Week 3-4)

- Build Home page (hero + features + pricing + CTA)
- Build Pricing page
- Build About page
- Implement responsive navigation
- Add language toggle (EN/FR)

### Phase 3: Content & Assets (Week 5)

- Source and optimize all images
- Create feature illustrations (unDraw)
- Write copy for all pages
- Add testimonials and social proof
- Implement SEO meta tags

### Phase 4: Polish & Launch (Week 6)

- Add scroll animations (AOS)
- Optimize performance (Lighthouse 90+)
- Test accessibility (axe, WAVE)
- Test on mobile devices
- Deploy to Azure Static Web Apps

---

## Success Metrics

### Performance

- Lighthouse Score: 90+ (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

### Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation functional
- Screen reader compatible
- Color contrast ratios met

### Business

- Conversion rate: 3-5% (visitor to trial sign-up)
- Bounce rate: < 50%
- Average session duration: > 2 minutes
- Pages per session: > 3

---

## Design Resources Summary

### Fonts

- **Poppins**: https://fonts.google.com/specimen/Poppins (OFL License)

### Images

- **Unsplash**: https://unsplash.com (Free license)
- **Pexels**: https://pexels.com (Free license)
- **Pixabay**: https://pixabay.com (Free license)

### Icons

- **Heroicons**: https://heroicons.com (MIT License)
- **Lucide**: https://lucide.dev (MIT License)

### Illustrations

- **unDraw**: https://undraw.co (Open-source)
- **Storyset**: https://storyset.com (Free with attribution)

### Animations

- **AOS**: https://michalsnik.github.io/aos/ (MIT License)

---

## Next Steps

1. Create design mockups in Figma (optional but recommended)
2. Set up Next.js + Tailwind project
3. Implement component library
4. Source and optimize assets
5. Build core pages
6. Test and optimize
7. Deploy to Azure Static Web Apps

---

## Appendix: Sample Component Code

### Hero Component (React/Next.js)

```jsx
// components/Hero.jsx
import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column: Content */}
          <div className="text-center lg:text-left">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 lg:text-6xl">
              Empower Your Organization with{' '}
              <span className="text-primary-600">Anti-Black Racism</span> Insights
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-600 lg:text-xl">
              Comprehensive training, case law analysis, and AI-powered coaching to build more
              equitable workplaces across Canada.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/signup" className="btn-primary">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn-secondary">
                View Demo
              </Link>
            </div>
            {/* Trust Indicators */}
            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-gray-600 lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>500+ Organizations</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>WCAG 2.1 AA Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Image/Illustration */}
          <div className="relative">
            <Image
              src="/images/illustrations/hero-dashboard.svg"
              alt="ABR Insights Platform Dashboard"
              width={600}
              height={500}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Feature Card Component

```jsx
// components/FeatureCard.jsx
export default function FeatureCard({ icon, title, description, link }) {
  return (
    <div className="feature-card group">
      <div className="mb-4 h-12 w-12 text-primary-600">{icon}</div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      <a
        href={link}
        className="inline-flex items-center font-medium text-primary-600 transition-colors hover:text-primary-700"
      >
        Learn more
        <svg
          className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  )
}
```

---

**Document Status**: Ready for implementation review and design mockup creation.
