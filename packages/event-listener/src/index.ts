import Web3 from 'web3';

import { ConfigurationClient, OffChainDataClient } from '@energyweb/origin-backend-client';
import { EmailServiceProvider, IEmailServiceProvider } from './services/email.service';
import { IEmailAdapter } from './email/IEmailAdapter';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { IOriginEventListener, OriginEventListener } from './listeners/origin.listener';
import { OriginEventsStore, IOriginEventsStore } from './stores/OriginEventsStore';

export const SCAN_INTERVAL = 3000;

const startEventListener = async () => {
    const web3 = new Web3(process.env.WEB3 || 'http://localhost:8550');
    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost:3035';
    const baseUrl = `${backendUrl}/api`;

    let storedMarketContractAddresses: string[] = [];

    console.log(`[EVENT-LISTENER] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await new ConfigurationClient().get(
            baseUrl,
            'MarketContractLookup'
        );

        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    console.log(`[EVENT-LISTENER] Starting for Market ${storedMarketContractAddress}`);

    const latestMarketContract: string =
        process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;

    const emailAdapter: IEmailAdapter = new MandrillEmailAdapter(process.env.MANDRILL_API_KEY);
    const emailService: IEmailServiceProvider = new EmailServiceProvider(
        emailAdapter,
        process.env.EMAIL_FROM
    );
    const originEventsStore: IOriginEventsStore = new OriginEventsStore();

    const listener: IOriginEventListener = new OriginEventListener(
        latestMarketContract,
        web3,
        emailService,
        originEventsStore,
        new OffChainDataClient()
    );

    await listener.start();
};

export { startEventListener };
