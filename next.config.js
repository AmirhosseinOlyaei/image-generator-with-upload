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
    unoptimized: true, // Required for Cloudflare Pages
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Configure for Cloudflare Pages with server-side rendering
  output: 'standalone',
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    // Split chunks to reduce file sizes
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 20 * 1024 * 1024, // 20 MB max chunk size (under Cloudflare's 25MB limit)
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](@react|react|react-dom|next|@next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Safely handle module context that might be null
              if (!module.context) {
                return 'npm.unknown'
              }
              const match = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
              )
              if (!match || !match[1]) {
                return 'npm.unknown'
              }
              return `npm.${match[1].replace('@', '')}`
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
