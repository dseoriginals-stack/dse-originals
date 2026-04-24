const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // Cache images for 1 week to drastically improve speeds
    remotePatterns: [
      // ✅ Cloudinary (MAIN - required)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },

      // ✅ Production API
      {
        protocol: "https",
        hostname: "api.dseoriginals.com",
        pathname: "/**",
      },

      // ✅ Local backend (for dev testing)
      {
        protocol: "http",
        hostname: "localhost",
        port: "10000",
        pathname: "/**",
      },
    ],
  },
}

module.exports = withPWA(nextConfig)