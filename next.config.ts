import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow cross-origin requests from z.ai preview
  allowedDevOrigins: [
    'preview-chat-c1f65467-0354-4435-bc6c-e3c9ae5b30a3.space.z.ai',
    'preview-chat-c1f65467-0354-4435-bc6c-e3c9ae5b30a3.space.z.ai:*',
  ],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure server binds to all interfaces
  experimental: {
    // Force server to listen on all interfaces
  },
};

export default nextConfig;
