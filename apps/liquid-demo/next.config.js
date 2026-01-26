const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    // apps/README.md#Apps and internal packages
    config.resolve.modules.unshift(path.resolve(__dirname, "node_modules"));

    return config;
  },
};

module.exports = nextConfig;
