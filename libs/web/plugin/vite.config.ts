import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import {
  assetsInclude,
  tsconfigBaseAliases,
} from '../../../libs/web/util-vite-config/src'

const resolve = (p: string): string => path.resolve(__dirname, p)

export default defineConfig({
  assetsInclude,
  resolve: {
    alias: {
      '@theme/': `${resolve('../../../libs/web/ui-theme/src')}/`,
      ...tsconfigBaseAliases(),
    },
  },
  plugins: [Vue()],
  build: {
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'plugin',
      fileName: (format) => `plugin.${format}.js`,
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled
      external: ['vue'],
      output: {
        // globals to use in the UMD build for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
