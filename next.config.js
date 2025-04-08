/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
  // Disable image optimization temporarily if causing issues
  images: {
    unoptimized: true
  },
  // Output a standalone build for easier deployment
  output: 'standalone'
};

module.exports = nextConfig; 