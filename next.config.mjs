/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['ffmpeg-static'],
    outputFileTracingIncludes: {
      '/api/cafe/python-export': ['./node_modules/ffmpeg-static/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clip.cafe',
      },
    ],
  },
};

export default nextConfig;
