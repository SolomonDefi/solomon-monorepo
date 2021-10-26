import * as path from 'path'
import pkgDir from 'pkg-dir'

export class PathStore {
  get root(): string {
    return pkgDir.sync() || ''
  }

  get watcher() {
    return path.resolve(this.root, 'apps', 'blockchain-watcher')
  }

  get doc() {
    return path.resolve(this.root, 'apps', 'developer-docs')
  }

  get scripts() {
    return path.resolve(this.root, 'tools', 'scripts')
  }
}

export const pathStore = new PathStore()
