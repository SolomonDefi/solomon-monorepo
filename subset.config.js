const allApi = [
  // devDependencies
  '@nrwl/cli',
  '@nrwl/cypress',
  'nx-python-fastapi',
  'shelljs',
  'typescript',
]

module.exports = {
  'web-evidence': {
    include: [
      // dependencies
      'vue',
      '@sampullman/vue3-fetch-api',
      'vue-i18n',
      'vue-router',
      // devDependencies
      '@vitejs/plugin-vue',
      'nx-vue3-vite',
      'vite',
      'unplugin-vue-components',
      'vite-plugin-vue-images',
      '@nrwl/cli',
      '@nrwl/workspace',
    ],
  },
  'api-evidence': {
    include: [...allApi],
  },
  'api-dispute': {
    include: [...allApi],
  },
  'db-dev': {
    include: [
      // dependencies
      'pg',
      'dotenv',
      // devDependencies
      'husky',
    ],
  },
}
