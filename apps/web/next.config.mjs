/** @type {import('next').NextConfig} */
import path from 'path'
import { fileURLToPath } from 'url'
import { withSentryConfig } from '@sentry/nextjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// next-auth (next-auth/react) reads `process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL`
// at module-load time and feeds it straight into `new URL(...)`. On real Vercel
// VERCEL_URL is a non-empty host, but during static prerendering (local `next build`
// or a pulled preview env) VERCEL_URL can be an empty string. Because `??` does not
// catch empty strings, next-auth ends up calling `new URL('')`, which throws
// `Invalid URL` and aborts the export of every page that mounts the shared
// SessionProvider (e.g. /store/nrpg-lanyard, /_not-found, all city/service pages).
//
// next.config is loaded by every build/export worker, so normalising here guarantees
// a valid NEXTAUTH_URL is present before next-auth is imported. This is a no-op when
// NEXTAUTH_URL is already set.
if (process.env.VERCEL_URL === '') {
  delete process.env.VERCEL_URL
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://disasterrecovery.com.au'
}

const nextConfig = {
  // Performance: Enable React strict mode for better development practices
  reactStrictMode: true,

  // Performance: Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Build optimization
  // NOTE: TypeScript/ESLint checking disabled during build due to memory constraints
  // TypeScript errors are tracked and being resolved - see .planning/ROADMAP.md Phase 1
  // Run `npx tsc --noEmit` locally to check types (requires 8GB+ memory)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image Optimization - WebP and AVIF support
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'chart.googleapis.com',
      },
    ],
  },

  // Compression - Enable gzip and brotli
  compress: true,

  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // CORS lockdown — restrict API access to trusted origins only
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CORS_ORIGIN || 'https://disasterrecovery.com.au',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, stripe-signature, x-xero-signature',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP) - Updated with Supabase Realtime support
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com https://vercel.live https://*.vercel.app https://va.vercel-scripts.com https://*.sentry.io",
              "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://*.cloudinary.com https://*.vercel-storage.com https://cdn.sanity.io https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com https://hcaptcha.com https://*.hcaptcha.com",
              "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.vercel.app https://vercel.live wss://*.vercel.app wss://vercel.live https://*.stripe.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
              "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.stripe.com https://vercel.live",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "manifest-src 'self'",
              "media-src 'self' https://*.cloudinary.com https://*.vercel-storage.com",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // X-Frame-Options (prevent clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options (prevent MIME sniffing)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-XSS-Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy (restrict browser features)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=(self)',
              'interest-cohort=()',
              'payment=(self)',
              'usb=()',
            ].join(', '),
          },
          // Strict-Transport-Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // Enable experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
    ],

    // Server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
      bodySizeLimit: '2mb',
    },

    // Include training sources in Vercel deployment
    // CRITICAL: Ensures both HTML sources and index files are bundled in serverless functions
    outputFileTracingIncludes: {
      '/api/**/*': [
        './lib/training/sources/**/*',
        './lib/training/generated/**/*',
        // NRPG-Onboarding-Framework — course JSON/markdown read at runtime by course-loader.ts
        // Without this, fs.readdirSync and fs.readFileSync calls fall back to hardcoded data.
        '../../NRPG-Onboarding-Framework/**/*',
      ],
    },
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@anthropic-ai/claude-agent-sdk': path.resolve(__dirname, './src/shims/claude-agent-sdk'),
    }

    // Suppress webpack noise in development
    if (dev) {
      config.infrastructureLogging = {
        level: 'error', // Only show errors, not info/warnings
      }
      config.stats = 'errors-warnings' // Minimal output
    }

    // Production optimizations
    // NOTE: Custom splitChunks removed — it forced ALL node_modules into a single
    // 1.45 MB vendor chunk, defeating Next.js's built-in granular code splitting.
    // Next.js 14 handles chunk splitting, tree shaking, and lazy loading automatically.

    return config
  },

  // PoweredByHeader: Remove for security
  poweredByHeader: false,

  // Redirects
  async redirects() {
    return [
      // CleanExpo247 Trade Hall lives in its own Vercel project. Redirect (not proxy) so the
      // hall runs on its own origin: no nrpg.business cookies are forwarded to it and its
      // scripts get no same-origin access to /api. Temporary so the target can change later.
      { source: '/trade-hall', destination: 'https://cleanexpo247-hall.vercel.app/trade-hall', permanent: false },
      // DR-950: /claim has no page; the claim flow starts at step 1. Query strings carry over.
      { source: '/claim', destination: '/claim/step-1', permanent: true },
    ]
  },

  // Rewrites
  async rewrites() {
    return []
  },
}

// Source-map upload only works when a Sentry auth token is present. On Vercel builds
// without SENTRY_AUTH_TOKEN the plugin still *generates* the (widened) source maps and
// then discards them ("No auth token provided. Will not upload source maps"), which
// exhausts the build container's RAM and OOM-kills the build. Per Sentry's docs, the
// documented fix for build OOM is to disable source-map generation. Gate the heavy
// work on the token so release builds still get full source maps.
const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN)

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Skip source-map generation entirely when we can't upload — prevents build OOM.
  sourcemaps: {
    disable: !hasSentryAuthToken,
  },

  // Upload a larger set of source maps for prettier stack traces (increases build time
  // and memory) — only worth it when we actually have a token to upload them.
  widenClientFileUpload: hasSentryAuthToken,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry DSN is configured in the Sentry initialization config.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific Sentry options (migrated from deprecated top-level keys)
  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See: https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,
  },
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
