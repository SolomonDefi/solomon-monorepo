import path from 'path'
import tsconfigBase from '../../../../../tsconfig.base.json'

const rootOffset = '../../../../../'

const resolve = (p: string) => path.resolve(__dirname, p)

export const tsconfigBaseAliases = (): Record<string, string> => {
  const paths = tsconfigBase.compilerOptions?.paths || []
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

export const appConfigServer = {
  fs: {
    strict: true,
    allow: ['../../'],
  },
  watch: {
    usePolling: true,
    interval: 300,
    binaryInterval: 1000,
  },
}

export const assetsInclude = /\.(pdf|jpg|png|svg)$/

export const appConfigBuild = { emptyOutDir: true }
