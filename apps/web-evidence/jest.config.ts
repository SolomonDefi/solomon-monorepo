module.exports = {
  displayName: 'web-evidence',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000,
}
