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

// Step 2: Run the Next.js build with minimal configuration
console.log('📦 Building Next.js application...')
try {
  // Run the build
  execSync('next build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}

// Step 3: Create a minimal deployment package for Cloudflare Pages
console.log('📦 Creating deployment package for Cloudflare Pages...')

// Create deployment directory
const deployDir = '.cloudflare/deploy'
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true })
}
fs.mkdirSync(deployDir, { recursive: true })

// Copy only the essential files
console.log('📋 Copying essential files...')

// Copy public directory
execSync(`cp -R public ${deployDir}/`, { stdio: 'inherit' })

// Copy .next/static to _next/static
fs.mkdirSync(`${deployDir}/_next/static`, { recursive: true })
execSync(`cp -R .next/static/* ${deployDir}/_next/static/`, { stdio: 'inherit' })

// Create a simple index.html file
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghibli Vision</title>
  <meta http-equiv="refresh" content="0;url=/dashboard" />
</head>
<body>
  <p>Redirecting to dashboard...</p>
</body>
</html>
`
fs.writeFileSync(`${deployDir}/index.html`, indexHtml)

// Create a _routes.json file for Cloudflare Pages
const routesJson = {
  version: 1,
  include: ['/*'],
  exclude: [],
}
fs.writeFileSync(`${deployDir}/_routes.json`, JSON.stringify(routesJson, null, 2))

console.log('✅ Deployment package created successfully!')
console.log(`🌐 Deploy the "${deployDir}" directory to Cloudflare Pages`)
