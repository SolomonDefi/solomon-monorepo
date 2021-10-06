module.exports = {
  displayName: 'plugin',
  preset: '../../../jest.preset.ts',
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  testTimeout: 10000,
}
