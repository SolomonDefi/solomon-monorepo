import BlockchainWatcher from './BlockchainWatcher';
import { sendContractEmail } from './Mailer';
import { emailsFromAddress } from './ContractWrap';
import { ethereumNodeUrl, factoryAddress } from './Config';

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
