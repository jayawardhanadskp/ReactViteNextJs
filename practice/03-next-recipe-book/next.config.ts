import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true, // the Next.js 16 caching model: 'use cache', Suspense, Partial Prerendering
  partialPrefetching: true,
  turbopack: {
    rules: {
      // lets Turbopack (Next.js's bundler) process Tailwind CSS
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
