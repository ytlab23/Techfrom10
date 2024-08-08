/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "www.researchgate.net",
      },
    ],
  },
};

export default nextConfig;
