// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'one.newkerala.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cnn.com',
      },
      {
        protocol: 'https',
        hostname: 'static01.nyt.com',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'media.npr.org',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;

export { reportWebVitals } from './utils/performance-metrics';
