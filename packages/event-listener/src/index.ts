import Web3 from 'web3';
import axios, { AxiosResponse } from 'axios';

import { EmailServiceProvider, IEmailServiceProvider } from './services/email.service';
import { IEmailAdapter } from './email/IEmailAdapter';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { IOriginEventListener, OriginEventListener } from './listeners/origin.listener';
import { OriginEventsStore, IOriginEventsStore } from './stores/OriginEventsStore';

export const SCAN_INTERVAL = 3000;

const startEventListener = async () => {
    const web3 = new Web3(process.env.WEB3 || 'http://localhost:8550');
    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost:3035';

    const result: AxiosResponse = await axios.get(`${backendUrl}/api/MarketContractLookup`);

    const latestMarketContract: string = process.env.MARKET_CONTRACT_ADDRESS || result.data.pop();

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
        originEventsStore
    );

    await listener.start();
};

export { startEventListener };
