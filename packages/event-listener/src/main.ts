import dotenv from 'dotenv';
import { OffChainDataClient } from '@energyweb/origin-backend-client';

import { startEventListener } from './index';

(async () => {
    dotenv.config({
        path: '../../.env'
    });

    await startEventListener({
        web3Url: process.env.WEB3,
        offChainDataSourceUrl: process.env.BACKEND_URL,
        offChainDataSourceClient: new OffChainDataClient(),
        accountPrivKey: process.env.EVENT_LISTENER_PRIV_KEY,
        scanInterval: 3000,
        notificationInterval: 60000,
        mandrillApiKey: process.env.MANDRILL_API_KEY,
        emailFrom: process.env.EMAIL_FROM
    });
})();
