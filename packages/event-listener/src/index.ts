import Web3 from 'web3';
import { EmailServiceProvider } from './services/email.service';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { OriginEventListener } from './listeners/origin.listener';
import { OriginEventsStore } from './stores/OriginEventsStore';
import { IEventListenerConfig } from './config/IEventListenerConfig';
import { initOriginConfig } from './config/origin.config';

const startEventListener = async (listenerConfig: IEventListenerConfig) => {
    let storedMarketContractAddresses: string[] = [];

    console.log(`[EVENT-LISTENER] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await listenerConfig.offChainDataSource.configurationClient.get(
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    console.log(`[EVENT-LISTENER] Starting for Market ${storedMarketContractAddress}`);

    const latestMarketContract = listenerConfig.marketLogicAddress || storedMarketContractAddress;

    const emailAdapter = new MandrillEmailAdapter(listenerConfig.mandrillApiKey);
    const emailService = new EmailServiceProvider(emailAdapter, listenerConfig.emailFrom);
    const originEventsStore = new OriginEventsStore();

    const web3 = new Web3(listenerConfig.web3Url || 'http://localhost:8550');
    const conf = await initOriginConfig(latestMarketContract, web3, listenerConfig);

    const listener = new OriginEventListener(
        conf,
        listenerConfig,
        latestMarketContract,
        emailService,
        originEventsStore
    );

    await listener.start();
};

export { startEventListener };
