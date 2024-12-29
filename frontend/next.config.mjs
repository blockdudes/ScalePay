/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV == "development" && {
    cacheMaxMemorySize: 0,
    webpack: (config) => {
      config.resolve.fallback = { fs: false, net: false, tls: false };
      config.externals.push("pino-pretty", "encoding");
      return config;
    },
  }),
  reactStrictMode: false,
};

export default nextConfig;
