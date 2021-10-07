import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueI18n from '@intlify/vite-plugin-vue-i18n'

module.exports = defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  plugins: [Vue(), VueI18n()],
  resolve: {
    alias: {
      '@theme/': `${path.resolve(__dirname, '../ui-theme/src')}/`,
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'ui-widgets',
      fileName: (format) => `ui-widgets.${format}.js`,
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
