/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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

module.exports = nextConfig