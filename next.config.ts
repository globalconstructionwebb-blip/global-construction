import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/iordningstallande-ritningar',
        destination: '/iordningstallanderitningar',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: '/', destination: '/index.html' }
      ],
      fallback: [
        {
          source: '/:path*',
          destination: '/:path*.html',
        },
      ],
    };
  },
};

export default nextConfig;
