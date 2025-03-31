#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('\n🌟 Welcome to Ghibli Vision Setup 🌟\n')
console.log('This script will help you set up your development environment.\n')

// Check if .env.local exists
const envExists = fs.existsSync('./.env.local')
if (!envExists) {
  console.log('Creating .env.local file from example...')
  fs.copyFileSync('./.env.local.example', './.env.local')
  console.log(
    '✅ Created .env.local file. Please edit it with your API keys.\n',
  )
} else {
  console.log('✅ .env.local file already exists.\n')
}

// Create public directories for images
const directories = [
  './public/images',
  './public/images/ghibli-samples',
  './public/images/uploads',
  './public/images/generated',
]

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  } else {
    console.log(`✅ Directory already exists: ${dir}`)
  }
})

console.log('\nChecking dependencies...')
try {
  execSync('pnpm -v', { stdio: 'ignore' })
  console.log('✅ pnpm is installed.')
} catch (error) {
  console.log('❌ pnpm is not installed. Please install it with:')
  console.log('   npm install -g pnpm')
  process.exit(1)
}

console.log('\nWould you like to install project dependencies? (Y/n)')
rl.question('> ', answer => {
  if (answer.toLowerCase() !== 'n') {
    console.log('\nInstalling dependencies...')
    try {
      execSync('pnpm install', { stdio: 'inherit' })
      console.log('✅ Dependencies installed successfully.\n')
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message)
      process.exit(1)
    }
  }

  console.log('\nWould you like to start the development server? (Y/n)')
  rl.question('> ', answer => {
    if (answer.toLowerCase() !== 'n') {
      console.log('\nStarting development server...')
      try {
        execSync('pnpm dev', { stdio: 'inherit' })
      } catch (error) {
        console.error('❌ Failed to start development server:', error.message)
        process.exit(1)
      }
    } else {
      console.log('\n🎉 Setup complete! 🎉')
      console.log('Run the development server anytime with:')
      console.log('   pnpm dev')
      rl.close()
    }
  })
})
