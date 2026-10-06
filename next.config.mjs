/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['10.10.10.128', 'localhost:3000', '127.0.0.1:3000'],
}

export default nextConfig
