import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
// TODO -- is it possible to get tsconfig paths to work in vite.config.ts?
import {
  appConfigBuild,
  assetsInclude,
  appConfigServer,
  tsconfigBaseAliases,
} from '../../libs/web/util-vite-config/src'

const resolve = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  assetsInclude,
  resolve: {
    alias: {
      '@theme/': `${resolve('../../libs/web/ui-theme/src')}/`,
      ...tsconfigBaseAliases(),
    },
  },
  build: appConfigBuild,
  server: appConfigServer,
  publicDir: resolve('./src/public'),
  plugins: [Vue()],
})
