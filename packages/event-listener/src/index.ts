import { EmailServiceProvider } from './services/email.service';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { OriginEventListener } from './listeners/origin.listener';
import { OriginEventsStore } from './stores/OriginEventsStore';
import { IEventListenerConfig } from './config/IEventListenerConfig';

const startEventListener = async (config: IEventListenerConfig) => {
    const backendUrl: string = config.offChainDataSourceUrl || 'http://localhost:3035';
    const baseUrl = `${backendUrl}/api`;

    let storedMarketContractAddresses: string[] = [];

    console.log(`[EVENT-LISTENER] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await config.configurationClient.get(
            baseUrl,
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    console.log(`[EVENT-LISTENER] Starting for Market ${storedMarketContractAddress}`);

    const latestMarketContract = config.marketLogicAddress || storedMarketContractAddress;

    const emailAdapter = new MandrillEmailAdapter(config.mandrillApiKey);
    const emailService = new EmailServiceProvider(emailAdapter, config.emailFrom);
    const originEventsStore = new OriginEventsStore();

    const listener = new OriginEventListener(
        config,
        latestMarketContract,
        emailService,
        originEventsStore
    );

    await listener.start();
};

export { startEventListener };
