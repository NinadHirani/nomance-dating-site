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
    // Lint errors now fail the build (the codebase lints with zero errors).
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
