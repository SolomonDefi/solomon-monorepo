import * as path from "path";

class PathStore {
  get root() {
    return __dirname
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
