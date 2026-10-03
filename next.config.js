const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jykvgvhkwywqzmhzbdxr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
