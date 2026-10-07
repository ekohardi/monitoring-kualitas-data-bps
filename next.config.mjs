/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.local',
    '10.10.10.123',
    '10.10.10.128',
    '10.10.10.195',
    ...Array.from({ length: 254 }, (_, i) => `10.10.10.${i + 1}`),
    ...Array.from({ length: 254 }, (_, i) => `192.168.1.${i + 1}`),
    ...Array.from({ length: 254 }, (_, i) => `192.168.0.${i + 1}`),
  ],
}

export default nextConfig
