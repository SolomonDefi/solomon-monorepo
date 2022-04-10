const base = [
  'nx',
  '@nrwl/workspace',
  'ts-node',
  'tsconfig-paths',
  'tslib',
  'typescript',
  'pkg-dir',
  'date-fns', // logger
  'js-base64',
]

const node = [
  // dependencies
  '@mikro-orm/core',
  '@ethersproject/providers',
  '@ethersproject/abi',
  'mjml',
  'fs-extra',
  'uuid',
  'ethers',
  'nodemailer',
  'mailgun.js',
  'handlebars',
  'form-data',
  'tslib',
  'reflect-metadata',
  'pkg-dir',
  'class-validator',
  'js-sha256',
  'express',
  'node-fetch',
  // devDependencies
  '@nrwl/node',
  '@types/mjml',
  '@types/fs-extra',
  '@types/nodemailer',
  '@types/uuid',
  '@types/express',
  '@types/node-fetch',
  'typescript',
]

module.exports = {
  'web-evidence': {
    workspace: ['libs/web'],
    include: [
      ...base,
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
    include: [
      ...base,
      ...node,
      // dependencies
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/jwt',
      '@nestjs/passport',
      '@nestjs/platform-express',
      '@nestjs/swagger',
      'class-validator',
      'date-fns',
      'knex',
      'lodash',
      'multer',
      'passport-anonymous',
      'passport-headerapikey',
      'reflect-metadata',
      'swagger-ui-express',
      // devDependencies
      '@nestjs/schematics',
      '@nestjs/testing',
      '@types/lodash',
      '@types/multer',
      '@types/passport-anonymous',
      'typescript',
    ],
  },
  'blockchain-watcher': {
    include: [...base, ...node, 'sqlite3', '@mikro-orm/sqlite'],
  },
  contracts: {
    include: [
      ...base,
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
