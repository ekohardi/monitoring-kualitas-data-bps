/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '10.10.10.128',
    '10.10.10.195:3523',
    'kualitasse.bpstuban.my.id',
    '10.10.10.195',
    'localhost:3523',
    '127.0.0.1:3523',
    '10.10.10.128:3523',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
}

export default nextConfig
