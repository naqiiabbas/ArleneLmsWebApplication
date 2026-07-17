/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Allow document uploads (files streamed to server actions) up to 15MB.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
}

export default nextConfig
