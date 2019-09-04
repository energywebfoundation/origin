import axios from 'axios';
import Web3 from 'web3';

import { EmailServiceProvider, IEmailServiceProvider } from './email.service';
import { MandrillEmailAdapter } from './email/mandrill.adapter';
import { OriginEventTracker } from './event/OriginEventTracker';

export interface IEventServiceProvider {
    apiUrl: string;
    web3: Web3;
    trackers: OriginEventTracker[];
}

export class EventServiceProvider implements IEventServiceProvider {
    public apiUrl: string;
    public trackers: OriginEventTracker[];
    public web3: Web3;

    public emailService: IEmailServiceProvider;

    constructor (apiUrl: string, web3: Web3) {
        this.apiUrl = apiUrl;
        this.web3 = web3;
        this.trackers = [];

        const emailAdapter = new MandrillEmailAdapter(process.env.MANDRILL_API_KEY);
        this.emailService = new EmailServiceProvider(emailAdapter, 'no-reply@energyweb.org');
    }

    public async start() {
        await this.refreshTrackerList();
        await this.startInactiveTrackers();
    }

    public async refreshTrackerList() {
        const result = await axios.get(`${this.apiUrl}/OriginContractLookupMarketLookupMapping/`);

        const latestOriginContracts = Object.keys(result.data);
        const currentlyTrackingContracts = this.trackers.map(tracker => tracker.originLookupAddress);

        // Add any trackers from backend if missing
        for (const contract of latestOriginContracts) {
            if (!currentlyTrackingContracts.includes(contract)) {
                const tracker: OriginEventTracker = new OriginEventTracker(
                    contract,
                    this.web3,
                    this.emailService
                );

                this.trackers.push(tracker);
            }
        }

        // Remove trackers if deleted from backend
        for (const [i, tracker] of this.trackers.entries()) {
            if (!latestOriginContracts.includes(tracker.originLookupAddress)) {
                tracker.stop();
                this.trackers.splice(i, 1);
            }
        }

        this.startInactiveTrackers();
    }

    public stop() {
        for (const tracker of this.trackers) {
            if (tracker.started) {
                tracker.stop();
            }
        }
    }

    private async startInactiveTrackers() {
        for (const tracker of this.trackers) {
            if (!tracker.started) {
                await tracker.start();
            }
        }
    }
}
