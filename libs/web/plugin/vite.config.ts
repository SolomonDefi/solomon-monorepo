import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import ViteImages from 'vite-plugin-vue-images'

module.exports = defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  plugins: [
    Vue(),
    Components({
      dirs: ['src/lib'],
    }),
    ViteImages(),
  ],
  build: {
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
