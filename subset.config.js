const all = [
  'nx',
  '@nrwl/workspace',
  'sqlite3',
  'ts-node',
  'tsconfig-paths',
  'tslib',
  'typescript',
  'pkg-dir',
  'date-fns', // logger
  'js-base64',
]

const python = [
  // devDependencies
  '@nrwl/cypress',
  'nx-python-fastapi',
  'shelljs',
]

const node = [
  '@ethersproject/providers',
  '@ethersproject/abi',
  '@mikro-orm/core',
  '@mikro-orm/sqlite',
  '@nrwl/node',
  '@types/mjml',
  '@types/fs-extra',
  '@types/nodemailer',
  '@types/uuid',
  '@types/express',
  '@types/node-fetch',
  'mjml',
  'fs-extra',
  'uuid',
  'ethers',
  'nodemailer',
  'mailgun.js',
  'handlebars',
  'form-data',
  'typescript',
  'tslib',
  'reflect-metadata',
  'pkg-dir',
  'class-validator',
  'js-sha256',
  'express',
  'node-fetch',
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
      '@samatech/vue3-eth',
      'nx-vue3-vite',
      'vite',
      'vite-plugin-vue-images',
    ],
  },
  api: {
    include: [...all, ...node],
  },
  'api-evidence': {
    include: [...all, ...python],
  },
  'api-dispute': {
    include: [...all, ...python],
  },
  'blockchain-watcher': {
    include: [...all, ...node],
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
      '@types/mocha',
      '@types/node',
      'chai',
      'dotenv',
      'ethereum-waffle',
      'ethers',
      'hardhat',
      'hardhat-contract-sizer',
      'hardhat-deploy',
      'hardhat-gas-reporter',
      'solhint',
      'solidity-coverage',
      'typechain',
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
