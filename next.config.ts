import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  
  // Experimental features that might be useful for your app
  experimental: {
    // Enable if you're using server actions
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:4007"],
    },
  },
  
  // Image optimization configuration
  images: {
    // Configure domains if you're loading external images
    domains: [],
    // Disable image optimization in Docker if needed for better performance
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Environment variables that should be available to the client
  env: {
    // Add any environment variables your app needs
    // PORT will be set by Docker to 4007 for production
  },
  
  // Webpack configuration for additional optimizations
  webpack: (config, { isServer }) => {
    // Ensure path aliases work correctly in Docker
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    
    // Additional webpack configurations if needed for your PDF processing
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Optimize for production builds
  poweredByHeader: false,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;