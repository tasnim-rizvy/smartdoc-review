/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 70 }
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts']
};