/** @type {import('next').NextConfig} */

// Set only by the Cloudflare Workers build (`pnpm cf:build`). A normal
// `next build` is unaffected by anything it guards.
const cfWorkers = process.env.CF_WORKERS_BUILD === '1';

const nextConfig = {
  output: 'standalone',
  images: {
    // Workers has no sharp and no filesystem cache for the image optimizer,
    // so the public demo serves the remote URLs as they are. A Node deploy
    // keeps the optimizer and the allow-list below.
    unoptimized: cfWorkers,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
  // Lint and typecheck are their own CI jobs (`pnpm lint`,
  // `pnpm --filter @nextcommerce/web exec tsc --noEmit`). The demo deploy
  // publishes what those jobs report on; it does not re-gate on them.
  eslint: { ignoreDuringBuilds: cfWorkers },
  typescript: { ignoreBuildErrors: cfWorkers },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
