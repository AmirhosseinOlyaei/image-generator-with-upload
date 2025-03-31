module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/recommended',
    'prettier', // Make sure this is last to override other configs
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'prettier', // Add prettier as a plugin
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  // Add ignorePatterns to exclude generated files and build directories
  ignorePatterns: [
    '.next/**',
    'out/**',
    'dist/**',
    'node_modules/**',
    '*.config.js',
  ],
  rules: {
    'prettier/prettier': ['error'], // Run Prettier as an ESLint rule
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // We're using TypeScript
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      // This will help with interface method parameters
      'ignoreRestSiblings': true
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Add rule to allow any in certain cases
    '@typescript-eslint/no-explicit-any': 'warn',
    // Add HTML element rules for TypeScript
    'no-undef': 'off', // TypeScript handles this better
  },
}
