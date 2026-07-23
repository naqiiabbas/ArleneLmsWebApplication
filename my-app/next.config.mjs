/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build output for Docker (bundles a minimal node_modules + server.js).
  output: "standalone",
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
