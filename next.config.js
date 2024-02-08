/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["pvotaaukwfeabaqtahfu.supabase.co"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5328/:path*", // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;
