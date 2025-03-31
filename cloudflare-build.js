// cloudflare-build.js
// This script is used to build the application for Cloudflare Pages deployment
// It ensures that the build output is optimized and meets Cloudflare's file size limitations
/* eslint-disable no-console */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting optimized build for Cloudflare Pages...')

// Step 1: Clean any previous build artifacts
console.log('🧹 Cleaning previous build artifacts...')
const dirsToClean = ['.next', 'out', '.vercel']
dirsToClean.forEach(dir => {
  const dirPath = path.resolve(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
})

// Step 2: Run the Next.js static export build
console.log('📦 Building Next.js application with static export...')
try {
  // Modify next.config.js temporarily to enable static export
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.js')
  const originalConfig = fs.readFileSync(nextConfigPath, 'utf8')
  
  // Add output: 'export' to the config
  const modifiedConfig = originalConfig.replace(
    "output: 'standalone'",
    "output: 'export'"
  )
  
  fs.writeFileSync(nextConfigPath, modifiedConfig)
  
  // Run the build
  execSync('next build', { stdio: 'inherit' })
  
  // Restore original config
  fs.writeFileSync(nextConfigPath, originalConfig)
  
  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}

// Step 3: Prepare for Cloudflare Pages deployment
console.log('🔧 Preparing for Cloudflare Pages deployment...')
const outputDir = 'out'
const cfPagesDir = '.cloudflare/pages'

// Ensure the Cloudflare Pages directory exists
if (!fs.existsSync(cfPagesDir)) {
  fs.mkdirSync(cfPagesDir, { recursive: true })
}

// Create a _routes.json file to handle client-side routing
const routesJson = {
  version: 1,
  include: ['/*'],
  exclude: [],
}
fs.writeFileSync(
  path.join(outputDir, '_routes.json'),
  JSON.stringify(routesJson, null, 2),
)

console.log('✅ Build optimized for Cloudflare Pages!')
console.log(`🌐 Deploy the "${outputDir}" directory to Cloudflare Pages`)
