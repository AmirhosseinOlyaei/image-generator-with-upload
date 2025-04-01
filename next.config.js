/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  output: 'standalone',
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations for production client-side builds
    if (!dev && !isServer) {
      // Disable code splitting to keep bundle size under control
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          vendors: false,
        },
      }

      // Reduce the number of chunks
      config.optimization.runtimeChunk = false

      // Minimize the main bundle
      config.optimization.minimize = true
    }

    return config
  },
}

export default nextConfig
