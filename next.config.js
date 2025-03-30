/** @type {import('next').NextConfig} */
import nextConfig from 'next';

export default {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'supabase.co'],
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};
