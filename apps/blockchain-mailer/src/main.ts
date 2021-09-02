import BlockchainWatcher from './app/BlockchainWatcher';
import { sendContractEmail } from './app/Mailer';
import { emailsFromAddress } from './app/ContractWrap';
import envStore from './store/envStore';

const newContractWatcher = {
  address: envStore.factoryAddress,
  topics: [
    'ChargebackCreated(address)',
    'PreorderCreated(address)',
    'EscrowCreated(address)',
  ],
  callback: ((log: any, event: any) => {
    const { email1, email2 } = emailsFromAddress(event.arg1); // TODO
    sendContractEmail(email1, email2);
  }),
};

const blockchainWatch = new BlockchainWatcher({
  providerUrl: envStore.ethereumNodeUrl,
  watchers: [newContractWatcher],
})

blockchainWatch.start();
