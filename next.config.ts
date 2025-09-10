/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lawbridge-a0gx.onrender.com",
        pathname: "/**", 
      },
      {
        protocol: "https",
        hostname: "randomuser.me", 
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
