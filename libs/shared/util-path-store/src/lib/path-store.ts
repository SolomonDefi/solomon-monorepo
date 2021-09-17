import * as path from 'path'
import pkgDir = require('pkg-dir')

class PathStore {
  get root(): string {
    return pkgDir.sync()
  }

  get mailer() {
    return path.resolve(this.root, 'apps', 'blockchain-mailer')
  }

  get doc() {
    return path.resolve(this.root, 'apps', 'developer-docs')
  }

  get scripts() {
    return path.resolve(this.root, 'tools', 'scripts')
  }
}

export default new PathStore()
