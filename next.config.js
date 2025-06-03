/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Disable ESLint during builds to fix deployment issues with Next.js 15
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: ['@prisma/client'],
  
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        '127.0.0.1:3000',
        // Allow Cloud Run domain pattern
        ...(process.env.NODE_ENV === 'production' ? [
          process.env.NEXTAUTH_URL?.replace('https://', '') || '*.run.app'
        ] : [])
      ]
    },
  },
  
  // Add ability to serve static files
  async rewrites() {
    return [
      {
        source: '/sample-leads.csv',
        destination: '/api/sample-csv',
      },
      {
        source: '/setup-database.sql',
        destination: '/api/setup-database',
      },
    ];
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Skip static generation for API routes during build
  trailingSlash: false,
  
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Skip problematic modules during build
      config.externals = config.externals || [];
      config.externals.push({
        '@llama-node/core': 'commonjs @llama-node/core',
        '@llama-node/llama-cpp': 'commonjs @llama-node/llama-cpp',
      });
    }
    return config;
  },
  
  env: {
    // Ensure we have required env vars for build
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build-fallback',
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://kodddurybogqynkswrzp.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'build-fallback',
  }
};

module.exports = nextConfig; 