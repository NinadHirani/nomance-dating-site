import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Type errors now fail the build (the codebase type-checks cleanly).
    ignoreBuildErrors: false,
  },
  eslint: {
    // Lint still reports style issues (mostly explicit `any`); run `npm run lint` to see them.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
