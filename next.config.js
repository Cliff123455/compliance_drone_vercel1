/** @type {import('next').NextConfig} */
const { env } = require('process');

const nextConfig = {
  allowedDevOrigins: process.env.REPLIT_DOMAINS ? [process.env.REPLIT_DOMAINS.split(',')[0]] : [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
