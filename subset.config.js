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
    workspace: ['libs/web'],
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
  contracts: {
    include: [
      ...all,
      '@nomiclabs/hardhat-ethers',
      '@nomiclabs/hardhat-etherscan',
      '@nomiclabs/hardhat-solhint',
      '@nomiclabs/hardhat-waffle',
      '@typechain/ethers-v5',
      '@typechain/hardhat',
      '@types/chai',
      '@types/chai-as-promised',
      '@types/jest',
      'chai',
      'ethereum-waffle',
      'ethers',
      'hardhat',
      'hardhat-contract-sizer',
      'hardhat-deploy',
      'hardhat-gas-reporter',
      'nx-hardhat',
      'solidity-coverage',
      'ts-jest',
      'typechain',
      'typescript',
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
