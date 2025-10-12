/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'export' mode to enable server-side rendering
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables should be configured in deployment platform
  // Remove hardcoded values for security

  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /@supabase\/storage-js/,
      },
    ];
    return config;
