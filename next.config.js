/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config, { isServer }) {
    // Configures webpack to handle SVG files with SVGR. SVGR optimizes and transforms SVG files
    // into React components. See https://react-svgr.com/docs/next/

    // Grab the existing rule that handles SVG imports
    // @ts-ignore - rules is a private property that is not typed
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: 'static.wsky.dev',
        pathname: '/branding/**',
      },
      {
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  rewrites: async () => [
    {
      source: '/ingest/static/:path*',
      destination: 'https://eu-assets.i.posthog.com/static/:path*',
    },
    {
      source: '/ingest/:path*',
      destination: 'https://eu.i.posthog.com/:path*',
    },
    {
      source: '/ingest/decide',
      destination: 'https://eu.i.posthog.com/decide',
    },
  ],
  redirects: async () => [
    {
      source: '/lookup',
      destination: '/',
      permanent: true,
    },
  ],
  experimental: {
    webpackBuildWorker: true,
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

module.exports = nextConfig;
