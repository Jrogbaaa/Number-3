/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    }
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
};

module.exports = nextConfig; 