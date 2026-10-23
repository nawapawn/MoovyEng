/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clip.cafe',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/cafe/:path*',
        destination: 'http://127.0.0.1:3001/api/cafe/:path*',
      },
      {
        source: '/exports/:path*',
        destination: 'http://127.0.0.1:3001/exports/:path*',
      },
      {
        source: '/clips_cache/:path*',
        destination: 'http://127.0.0.1:3001/clips_cache/:path*',
      },
    ];
  },
};

export default nextConfig;
