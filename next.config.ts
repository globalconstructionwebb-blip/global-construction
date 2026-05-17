import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/om-oss', destination: '/om-oss.html' },
      { source: '/konstruktion', destination: '/konstruktion.html' },
      { source: '/skyddsrum', destination: '/skyddsrum.html' },
      { source: '/projekt', destination: '/projekt.html' },
      { source: '/blogg', destination: '/blogg.html' },
      { source: '/kontakt', destination: '/kontakt.html' },
      { source: '/faq', destination: '/faq.html' },
      { source: '/jobba-hos-oss', destination: '/jobba-hos-oss.html' }
    ];
  },
};

export default nextConfig;
