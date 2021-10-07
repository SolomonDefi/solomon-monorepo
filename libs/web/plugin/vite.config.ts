import path from 'path'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import ViteImages from 'vite-plugin-vue-images'
import Vue from '@vitejs/plugin-vue'
import tsconfigBase from '../../../tsconfig.base.json'

const resolve = (p: string) => path.resolve(__dirname, p)

const tsconfigBaseAliases = (rootOffset: string): Record<string, string> => {
  const paths: Record<string, string[]> = tsconfigBase.compilerOptions?.paths || []
  const aliases: Record<string, string> = {}
  for (const [name, path] of Object.entries(paths)) {
    const simplePath = path[0].replace('/*', '/')
    const relative = `${rootOffset}${simplePath}`
    if (name.includes('/*')) {
      const resolved = `${resolve(relative)}/`
      aliases[name.replace('/*', '/')] = resolved
    } else {
      aliases[name] = resolve(relative)
    }
  }
  return aliases
}

module.exports = defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  resolve: {
    alias: {
      '@theme/': `${resolve('../../../libs/web/ui-theme/src')}/`,
      ...tsconfigBaseAliases('../../../'),
    },
  },
  plugins: [Vue(), Components({ dirs: ['src/lib'] }), ViteImages()],
  build: {
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
