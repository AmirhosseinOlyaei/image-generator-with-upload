#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs/promises'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// eslint-disable-next-line no-console
console.log('\n🌟 Welcome to Ghibli Vision Setup 🌟\n')
// eslint-disable-next-line no-console
console.log('This script will help you set up your development environment.\n')

// Check if .env.local exists
async function checkEnvFile() {
  try {
    await fs.access('./.env.local')
    // eslint-disable-next-line no-console
    console.log('✅ .env.local file already exists.\n')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Creating .env.local file from example...')
    await fs.copyFile('./.env.local.example', './.env.local')
    // eslint-disable-next-line no-console
    console.log(
      '✅ Created .env.local file. Please edit it with your API keys.\n',
    )
  }
}

checkEnvFile()

// Create public directories for images
const directories = [
  './public/images',
  './public/images/ghibli-samples',
  './public/images/uploads',
  './public/images/generated',
]

async function createDirectories() {
  for (const dir of directories) {
    try {
      await fs.access(dir)
      // eslint-disable-next-line no-console
      console.log(`✅ Directory already exists: ${dir}`)
    } catch (error) {
      await fs.mkdir(dir, { recursive: true })
      // eslint-disable-next-line no-console
      console.log(`✅ Created directory: ${dir}`)
    }
  }
}

createDirectories()

// eslint-disable-next-line no-console
console.log('\nChecking dependencies...')
try {
  execSync('pnpm -v', { stdio: 'ignore' })
  // eslint-disable-next-line no-console
  console.log('✅ pnpm is installed.')
} catch (error) {
  // eslint-disable-next-line no-console
  console.log('❌ pnpm is not installed. Please install it with:')
  // eslint-disable-next-line no-console
  console.log('   npm install -g pnpm')
  process.exit(1)
}

// eslint-disable-next-line no-console
console.log('\nWould you like to install project dependencies? (Y/n)')
rl.question('> ', async answer => {
  if (answer.toLowerCase() !== 'n') {
    // eslint-disable-next-line no-console
    console.log('\nInstalling dependencies...')
    try {
      execSync('pnpm install', { stdio: 'inherit' })
      // eslint-disable-next-line no-console
      console.log('✅ Dependencies installed successfully.\n')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to install dependencies:', error.message)
      process.exit(1)
    }
  }

  // eslint-disable-next-line no-console
  console.log('\nWould you like to start the development server? (Y/n)')
  rl.question('> ', async answer => {
    if (answer.toLowerCase() !== 'n') {
      // eslint-disable-next-line no-console
      console.log('\nStarting development server...')
      try {
        execSync('pnpm dev', { stdio: 'inherit' })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to start development server:', error.message)
        process.exit(1)
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('\n🎉 Setup complete! 🎉')
      // eslint-disable-next-line no-console
      console.log('Run the development server anytime with:')
      // eslint-disable-next-line no-console
      console.log('   pnpm dev')
      rl.close()
    }
  })
})
