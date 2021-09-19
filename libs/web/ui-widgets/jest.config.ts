module.exports = {
  displayName: 'ui-widgets',
  preset: '../../../jest.preset.js',
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'vue'],
  testTimeout: 10000,
}
