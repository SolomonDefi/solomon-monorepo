import * as path from 'path'
import pkgDir from 'pkg-dir'

export class PathStore {
  get root(): string {
    return pkgDir.sync() || ''
  }

  get apps(): string {
    return path.resolve(this.root, 'apps')
  }

  get libs(): string {
    return path.resolve(this.root, 'libs')
  }

  get tools(): string {
    return path.resolve(this.root, 'tools')
  }

  get watcher() {
    return path.resolve(this.apps, 'blockchain-watcher')
  }

  get doc() {
    return path.resolve(this.apps, 'developer-docs')
  }

  get e2e() {
    return path.resolve(this.apps, 'app-e2e')
  }

  get mailTemplates() {
    return path.resolve(this.libs, 'blockchain-watcher', 'feature-template')
  }

  get scripts() {
    return path.resolve(this.tools, 'scripts')
  }
}

export const pathStore = new PathStore()
