/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Generate static HTML for Twitch
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true, // Prevent ESLint from blocking builds
  },
  typescript: {
    ignoreBuildErrors: true, // Prevent TypeScript errors from blocking builds
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.twitch.tv;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

