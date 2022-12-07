/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  ignoreBuildErrors: true,

  images: {
    domains: [
      "ak-marketplace.s3.eu-west-3.amazonaws.com",
      "avatars.dicebear.com",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      });
    }
    return config;
  },
};

const { withSuperjson } = require("next-superjson");

module.exports = withSuperjson()(nextConfig);
