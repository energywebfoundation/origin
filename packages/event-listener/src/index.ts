import Web3 from 'web3';

import { EventServiceProvider } from './services/event.service';

export const SCAN_INTERVAL = 3000;

const startEventListener = () => {
    const web3 = new Web3(process.env.WEB3 || 'http://localhost:8550');

    const eventService = new EventServiceProvider(process.env.BACKEND_URL, web3);

    setInterval(async () => {
        await eventService.refreshListenerList();
    }, SCAN_INTERVAL);
};

export { startEventListener, EventServiceProvider };
