import { watcherService } from "@solomon/blockchain-watcher/feature-app";

let run = async ()=> {
  await watcherService.init()
  await watcherService.start()
}

run()
