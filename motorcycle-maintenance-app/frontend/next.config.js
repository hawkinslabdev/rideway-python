/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable if you want to use Server Actions
    serverActions: true,
  },
  // Enable if you're using images
  images: {
    domains: ['localhost'], // Add your image domains
  },
}

module.exports = nextConfig