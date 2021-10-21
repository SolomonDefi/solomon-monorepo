const allPython = [
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
      '@vue/compiler-sfc',
      '@samatech/postcss-basics',
      'nx-vue3-vite',
      'vite',
      'unplugin-vue-components',
      'vite-plugin-vue-images',
      '@nrwl/cli',
      '@nrwl/workspace',
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
      '@nrwl/node',
      '@nrwl/cli',
      '@nrwl/workspace',
      'mjml',
      '@types/mjml',
      'fs-extra',
      '@types/fs-extra',
      '@mikro-orm/core',
      '@mikro-orm/sqlite',
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
