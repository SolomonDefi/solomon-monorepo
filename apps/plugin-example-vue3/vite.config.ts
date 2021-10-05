import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import ViteImages from 'vite-plugin-vue-images'

export default defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  publicDir: path.resolve(__dirname, './src/public'),
  plugins: [
    Vue(),
    Components({
      dirs: ['src/app/components'],
    }),
    ViteImages(),
  ],
})
