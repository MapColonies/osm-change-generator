module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  rootDir: '../../.',
  setupFiles: ['<rootDir>/tests/configurations/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/matchers.js'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!**/node_modules/**', '!**/vendor/**'],
  coverageReporters: ['text', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statments: -10,
    },
  },
};
