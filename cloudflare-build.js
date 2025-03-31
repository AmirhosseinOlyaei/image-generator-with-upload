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
const dirsToClean = ['.next', 'out', '.vercel', '.cloudflare/deploy']
dirsToClean.forEach(dir => {
  const dirPath = path.resolve(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`)
    fs.rmSync(dirPath, { recursive: true, force: true })
  }
})

// Step 2: Create a minimal static site without using Next.js build
console.log('📦 Creating minimal static site for Cloudflare Pages...')

// Create deployment directory
const deployDir = '.cloudflare/deploy'
fs.mkdirSync(deployDir, { recursive: true })

// Copy public directory
console.log('📋 Copying public assets...')
execSync(`cp -R public/* ${deployDir}/`, {
  stdio: 'inherit',
})

// Create HTML files for each route
const routes = [
  { path: 'index.html', title: 'Ghibli Vision - Transform Your Photos' },
  { path: 'dashboard/index.html', title: 'Dashboard - Ghibli Vision' },
]

console.log('📝 Creating HTML files...')
routes.forEach(route => {
  const dirPath = path.dirname(path.join(deployDir, route.path))
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${route.title}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 800px;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin: 0.5rem;
    }
    .button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${route.title}</h1>
    <p>This is a static version of the Ghibli Vision app. For the full interactive experience, please visit our main website.</p>
    <a href="/" class="button">Home</a>
    <a href="/dashboard" class="button">Dashboard</a>
    <a href="https://github.com/AmirhosseinOlyaei/image-generator-with-upload" class="button" target="_blank">GitHub Repository</a>
  </div>
</body>
</html>`

  fs.writeFileSync(path.join(deployDir, route.path), html)
})

// Create a _routes.json file for Cloudflare Pages
const routesJson = {
  version: 1,
  include: ['/*'],
  exclude: [],
}

fs.writeFileSync(
  `${deployDir}/_routes.json`,
  JSON.stringify(routesJson, null, 2),
)

console.log('✅ Static site created successfully!')
console.log(`🌐 Deploy the "${deployDir}" directory to Cloudflare Pages`)
