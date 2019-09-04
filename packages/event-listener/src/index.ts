import dotenv from 'dotenv';
import Web3 from 'web3';

import { EventServiceProvider } from './services/event.service';

export {
    EventServiceProvider
};

export const SCAN_INTERVAL = 3000;

(async () => {
    dotenv.config({
        path: '.env.dev'
    });

    const web3 = new Web3(process.env.WEB3 || 'http://localhost:8545');

    const eventService = new EventServiceProvider(
        process.env.API_BASE_URL,
        web3
    );

    setInterval(async () => {
        await eventService.refreshTrackerList();
    }, SCAN_INTERVAL);
})();
