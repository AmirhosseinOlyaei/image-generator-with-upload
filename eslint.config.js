import js from '@eslint/js'
import nextjs from '@next/eslint-plugin-next'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'build/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      'next-env.d.ts',
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      '@next/next': nextjs,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        File: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        HTMLInputElement: 'readonly',
        Request: 'readonly',
        React: 'readonly',
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        // Additional globals needed for polyfills
        self: 'readonly',
        global: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        XMLHttpRequest: 'readonly',
        ActiveXObject: 'readonly',
        Deno: 'readonly',
        Bun: 'readonly',
      },
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
      'no-undef': 'off', // Turning off as TypeScript handles this better
      'no-prototype-builtins': 'off',
      'no-empty': 'off',
      'no-cond-assign': 'off',
      'no-control-regex': 'off',
      'no-self-assign': 'off',
      'no-sparse-arrays': 'off',
    },
  },
]
