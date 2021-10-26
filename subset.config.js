const all = ['@nrwl/cli', '@nrwl/workspace', 'sqlite3', 'typescript']

const allPython = [
  ...all,
  // devDependencies
  '@nrwl/cli',
  '@nrwl/cypress',
  'nx-python-fastapi',
  'shelljs',
  'typescript',
]

module.exports = {
  base: {
    include: all,
  },
  'web-evidence': {
    include: [
      ...all,
      // dependencies
      'vue',
      '@sampullman/vue3-fetch-api',
      'vue-i18n',
      'vue-router',
      // devDependencies
      '@vitejs/plugin-vue',
      '@vue/compiler-sfc',
      '@samatech/postcss-basics',
      'nx-vue3-vite',
      'vite',
      'unplugin-vue-components',
      'vite-plugin-vue-images',
    ],
  },
  'api-evidence': {
    include: [...allPython],
  },
  'api-dispute': {
    include: [...allPython],
  },
  'blockchain-watcher': {
    include: [
      ...all,
      'mjml',
      '@types/mjml',
      'fs-extra',
      '@types/fs-extra',
      '@mikro-orm/core',
      '@mikro-orm/sqlite',
      '@nrwl/node',
      'uuid',
      '@types/uuid',
      'ethers',
      'nodemailer',
      '@types/nodemailer',
      'mailgun.js',
      'handlebars',
      'form-data',
      'typescript',
      'tslib',
      'reflect-metadata',
      'pkg-dir',
    ],
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
