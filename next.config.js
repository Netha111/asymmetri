/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Add this configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "prisma",
        "@prisma/client",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
