import { ethers } from 'ethers';

// TODO -- import contract ABIs

export default class BlockchainWatcher {
  watchers: any[];
  provider: any;

  constructor(options: any) {
    this.watchers = options.watchers;
    this.provider = new ethers.providers.JsonRpcProvider(options.providerUrl);
  }

  start() {
    if(this.watchers.length === 0) {
      throw new Error('Abort! At least one watcher must be set up');
    }
    for(let watcher of this.watchers) {
      const filter = {
        address: watcher.address,
        topics: (watcher.topics || []).map((t: string) => ethers.utils.id(t)),
      }
      // TODO parse/deserialize results
      this.provider.on(filter, watcher.callback);
    }
  }

  removeWatcher(name: string) {
    this.watchers = this.watchers.filter(w => w.name !== name);
  }

  addWatcher(watcher: any) {
    this.watchers.push(watcher);
  }

  setWatchers(watchers: any[]) {
    this.watchers = watchers;
  }
}