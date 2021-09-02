import BlockchainWatcher from './app/BlockchainWatcher';
import { sendContractEmail } from './app/Mailer';
import { emailsFromAddress } from './app/ContractWrap';
import { ethereumNodeUrl, factoryAddress } from './app/Config';

const newContractWatcher = {
  address: factoryAddress,
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
  providerUrl: ethereumNodeUrl,
  watchers: [newContractWatcher],
})

blockchainWatch.start();
