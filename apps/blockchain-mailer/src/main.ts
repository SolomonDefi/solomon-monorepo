import BlockchainWatcher from './app/BlockchainWatcher';
import { emailsFromAddress } from './app/ContractWrap';
import envStore from './store/envStore';
import mailService from './service/mailService';

const newContractWatcher = {
    address: envStore.factoryAddress,
    topics: [
        'ChargebackCreated(address)',
        'PreorderCreated(address)',
        'EscrowCreated(address)'
    ],
    callback: (async (log: any, event: any) => {
        const { email1, email2 } = emailsFromAddress(event.arg1); // TODO
        await mailService.sendContractEmail(email1, email2);
    })
};

const blockchainWatch = new BlockchainWatcher({
    providerUrl: envStore.ethereumNodeUrl,
    watchers: [newContractWatcher]
});

blockchainWatch.start();
