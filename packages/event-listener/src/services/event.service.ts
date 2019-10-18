import axios from 'axios';
import Web3 from 'web3';

import { EmailServiceProvider, IEmailServiceProvider } from './email.service';
import { IEmailAdapter } from '../email/IEmailAdapter';
import { MandrillEmailAdapter } from '../email/mandrill.adapter';
import { IOriginEventListener, OriginEventListener } from '../listeners/origin.listener';
import { OriginEventsStore, IOriginEventsStore } from '../stores/OriginEventsStore';

export interface IEventServiceProvider {
    apiUrl: string;
    web3: Web3;
    listeners: IOriginEventListener[];
}

export class EventServiceProvider implements IEventServiceProvider {
    public listeners: IOriginEventListener[];

    public emailService: IEmailServiceProvider;

    private originEventsStore: IOriginEventsStore;

    constructor(public apiUrl: string, public web3: Web3) {
        this.listeners = [];

        const emailAdapter: IEmailAdapter = new MandrillEmailAdapter(process.env.MANDRILL_API_KEY);
        this.emailService = new EmailServiceProvider(emailAdapter, process.env.EMAIL_FROM);
        this.originEventsStore = new OriginEventsStore();
    }

    public async start() {
        await this.refreshListenerList();
        await this.startInactiveListeners();
    }

    public async refreshListenerList() {
        const result = await axios.get(`${this.apiUrl}/MarketContractLookup`);

        const latestMarketContracts = result.data;

        // Add any listener from backend if missing
        for (const contract of latestMarketContracts) {
            const currentlyListeningContracts = this.listeners.map(
                listener => listener.marketLookupAddress
            );

            if (contract && !currentlyListeningContracts.includes(contract)) {
                const listener: IOriginEventListener = new OriginEventListener(
                    contract,
                    this.web3,
                    this.emailService,
                    this.originEventsStore
                );

                this.listeners.push(listener);
            }
        }

        // Remove listeners if deleted from backend
        for (const [i, listener] of this.listeners.entries()) {
            if (!latestMarketContracts.includes(listener.marketLookupAddress)) {
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
