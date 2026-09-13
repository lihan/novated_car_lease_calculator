import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.PAGES_BASE_PATH || undefined,
  images: { unoptimized: true },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default config;
