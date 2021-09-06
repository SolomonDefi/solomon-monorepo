import { ethers } from 'ethers';
import ContractWatcher from '../klass/ContractWatcher';

class WatcherService {
  watchers: ContractWatcher[] = []
  provider: any = null

  removeWatcher(id: string) {
    this.watchers = this.watchers.filter((w) => w.id !== id)
  }

  addWatcher(watcher: any) {
    this.watchers.push(watcher)
  }

  setWatchers(watchers: any[]) {
    this.watchers = watchers
  }

  setProvider(providerUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl)
  }

  start() {
    if (this.watchers.length === 0) {
      throw new Error('Abort! At least one watcher must be set up')
    }

    for (let watcher of this.watchers) {
      const filter = {
        address: watcher.address,
        topics: (watcher.topics || []).map((t: string) => ethers.utils.id(t)),
      }
      // TODO parse/deserialize results
      this.provider.on(filter, watcher.callback)
    }
  }

  constructor() {}
}

export default new WatcherService()
