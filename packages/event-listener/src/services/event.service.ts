import axios from 'axios';
import Web3 from 'web3';

import { EmailServiceProvider, IEmailServiceProvider } from './email.service';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { IOriginEventListener, OriginEventListener } from './listeners/origin.listener';

export interface IEventServiceProvider {
    apiUrl: string;
    web3: Web3;
    listeners: IOriginEventListener[];
}

export class EventServiceProvider implements IEventServiceProvider {
    public apiUrl: string;
    public listeners: IOriginEventListener[];
    public web3: Web3;

    public emailService: IEmailServiceProvider;

    constructor (apiUrl: string, web3: Web3) {
        this.apiUrl = apiUrl;
        this.web3 = web3;
        this.listeners = [];

        const emailAdapter = new MandrillEmailAdapter(process.env.MANDRILL_API_KEY);
        this.emailService = new EmailServiceProvider(emailAdapter, 'origin-no-reply@energyweb.org');
    }

    public async start() {
        await this.refreshListenerList();
        await this.startInactiveListeners();
    }

    public async refreshListenerList() {
        const result = await axios.get(`${this.apiUrl}/OriginContractLookupMarketLookupMapping/`);

        const latestOriginContracts = Object.keys(result.data);
        const currentlyListeningContracts = this.listeners.map(listener => listener.originLookupAddress);

        // Add any listener from backend if missing
        for (const contract of latestOriginContracts) {
            if (!currentlyListeningContracts.includes(contract)) {
                const listener: IOriginEventListener = new OriginEventListener(
                    contract,
                    this.web3,
                    this.emailService
                );

                this.listeners.push(listener);
            }
        }

        // Remove listeners if deleted from backend
        for (const [i, listener] of this.listeners.entries()) {
            if (!latestOriginContracts.includes(listener.originLookupAddress)) {
                listener.stop();
                this.listeners.splice(i, 1);
            }
        }

        this.startInactiveListeners();
    }

    public stop() {
        for (const listener of this.listeners) {
            if (listener.started) {
                listener.stop();
            }
        }
    }

    private async startInactiveListeners() {
        for (const listener of this.listeners) {
            if (!listener.started) {
                await listener.start();
            }
        }
    }
}
