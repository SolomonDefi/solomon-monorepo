module.exports = {
  displayName: 'plugin-example-vue3',
  preset: '../../jest.preset.ts',
  transform: {
    '^.+\\.vue$': './deps/vue3-jest',
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000,
}
