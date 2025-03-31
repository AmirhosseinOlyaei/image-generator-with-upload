// cloudflare-build.js
// This script is used to build the application for Cloudflare Pages deployment
// It ensures that the build output is optimized and meets Cloudflare's file size limitations
/* eslint-disable no-console */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting optimized build for Cloudflare Pages...')

// Step 1: Run the Next.js build with optimizations
console.log('📦 Building Next.js application...')
execSync('next build', { stdio: 'inherit' })

// Step 2: Ensure output directory exists
console.log('🔧 Preparing output for Cloudflare Pages...')
const outputDir = '.vercel/output/static'
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Step 3: Copy the necessary files to the output directory
console.log('📋 Copying build files to output directory...')
execSync(`cp -R .next/static ${outputDir}/_next/static`, { stdio: 'inherit' })
execSync(`cp -R public/* ${outputDir}/`, { stdio: 'inherit' })

// Step 4: Clean up unnecessary files to reduce size
console.log('🧹 Cleaning up unnecessary files...')
const cleanupDirs = ['.next/cache']

cleanupDirs.forEach(dir => {
  const dirPath = path.resolve(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
})

console.log('✅ Build completed successfully!')
console.log('🌐 Your application is ready for Cloudflare Pages deployment')
