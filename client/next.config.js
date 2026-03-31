/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dse-backend-g5qf.onrender.com",
        pathname: "/**",
      },
    ],

    // 🔥 IMPORTANT (prevents crash on bad images)
    unoptimized: false,
  },
}

module.exports = nextConfig