import envStore from './store/envStore';
import mailService from './service/mailService';
import ContractWatcher from './klass/ContractWatcher';
import watcherService from './service/watcherService';

let start = async () => {
  await mailService.init()

  const newContractWatcher = new ContractWatcher({
    address: envStore.factoryAddress,
    topics: [
      'ChargebackCreated(address)',
      'PreorderCreated(address)',
      'EscrowCreated(address)',
    ],
    callback: async (log: any, event: any) => {
      // TODO -- TESTING ONLY, REPLACE WITH REAL METHOD
      const email1 = 'solomondefi@gmail.com'
      const email2 = 'solomondefi@gmail.com'

      await mailService.sendContractEmail(email1, email2)
    },
  })

  watcherService.addWatcher(newContractWatcher)
  watcherService.setProvider(envStore.ethereumNodeUrl)
  watcherService.start()
}

start()
