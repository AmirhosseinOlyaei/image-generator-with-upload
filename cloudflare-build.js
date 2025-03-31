// cloudflare-build.js
// This script is used to build the application for Cloudflare Pages deployment
// It ensures that the build output is optimized and meets Cloudflare's file size limitations

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting optimized build for Cloudflare Pages...')

// Step 1: Run the Next.js build with optimizations
console.log('📦 Building Next.js application...')
execSync('next build', { stdio: 'inherit' })

// Step 2: Generate Cloudflare Pages compatible output
console.log('🔧 Generating Cloudflare Pages compatible output...')
execSync('npx @cloudflare/next-on-pages', { stdio: 'inherit' })

// Step 3: Clean up unnecessary files to reduce size
console.log('🧹 Cleaning up unnecessary files...')
const cleanupDirs = ['.next/cache']

cleanupDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
})

console.log('✅ Build completed successfully!')
console.log('Your application is now ready for Cloudflare Pages deployment.')
