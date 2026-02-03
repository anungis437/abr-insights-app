/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Enable standalone output for Docker/Container Apps deployment
  output: 'standalone',

  // HMR configuration for localhost development
  webpackDevMiddleware:
    process.env.NODE_ENV === 'development'
      ? {
          watchOptions: {
            poll: 1000,
            aggregateTimeout: 300,
          },
        }
      : undefined,

  // Next.js 15 Performance Optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Server actions optimization
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Note: Removed static export to support Supabase Auth callback routes
  // Azure Static Web Apps supports Next.js hybrid rendering

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },

  trailingSlash: true,

  // Turbopack configuration (for dev mode with --turbo)
  turbopack: {
    resolveAlias: {
      // Turbopack handles Node.js built-ins automatically, no fallbacks needed
    },
    // Turbopack uses different caching - no manual config needed
  },

  webpack: (config, { isServer, dev }) => {
    // Only apply webpack config when not using Turbopack
    // Turbopack is used with `next dev --turbo`

    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // CRITICAL FIX: Disable symlink resolution to prevent EISDIR errors
    // Windows exFAT filesystem issue with webpack symlink handling
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    }

    // CRITICAL: Disable snapshot entirely to fix Windows EISDIR error
    // This is a Next.js 15 + Webpack 5 + Windows bug
    config.snapshot = undefined

    // Fix for Windows EISDIR error with webpack 5 on Next.js
    // This is a known issue: https://github.com/vercel/next.js/issues/56114
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
    }

    // Disable filesystem caching which causes issues on Windows
    config.cache = false

    // Disable module resolution caching
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    }

    return config
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // World-class hygiene: Block _dev routes in production builds
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/_dev/:path*',
              destination: '/404',
              permanent: false,
            },
            {
              source: '/api/_dev/:path*',
              destination: '/404',
              permanent: false,
            },
          ]
        : []),
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(
  nextConfig,
  {
    org: 'nzila-ventures',
    project: 'abr_app',
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,
  },
  {
    hideSourceMaps: true,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    automaticVercelMonitors: true,
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
)
