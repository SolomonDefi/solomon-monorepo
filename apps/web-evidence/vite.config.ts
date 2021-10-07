import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import ViteImages from 'vite-plugin-vue-images'

export default defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  resolve: {
    alias: {
      '@theme/': `${path.resolve(__dirname, '../../libs/web/ui-theme/src')}/`,
    },
  },
  publicDir: path.resolve(__dirname, './src/public'),
  plugins: [
    Vue(),
    Components({
      dirs: ['src/app/components', '../../libs/web/ui-widgets'],
    }),
    ViteImages({ dirs: ['src/assets/img', '../../libs/web/ui-theme/src/img'] }),
  ],
})
