import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import {
  appConfigBuild,
  assetsInclude,
  appConfigServer,
  tsconfigBaseAliases,
} from '../../libs/web/util-vite-config/src'

const resolve = (p: string): string => path.resolve(__dirname, p)

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
