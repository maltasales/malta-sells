/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://qopnwgmmvfdopdtxiqbb.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcG53Z21tdmZkb3BkdHhpcWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzQxNjcsImV4cCI6MjA3MzExMDE2N30.a33jCyJEFyBg61tAU7rmbo0j7E5uOPZYYOakbI0vsZ4",
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcG53Z21tdmZkb3BkdHhpcWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNDE2NywiZXhwIjoyMDczMTEwMTY3fQ.hdJyOdnztovJ_qknzz_iVpqS-vgUdXLLw2Xo2OmTEic",
    CREATOMATE_API_KEY: "f218fea249c942878f191ae55ab70a31bf7ad4d14a08775bccde75ad9606e9e254575327438459419e435c6235416c56",
  },
};

module.exports = nextConfig;
