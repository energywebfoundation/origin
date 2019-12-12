import dotenv from 'dotenv';
import path from 'path';

import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';
import { ConfigurationClient } from '@energyweb/origin-backend-client';

(async () => {
    dotenv.config({
        path: '.env.test'
    });

    const contractConfig = await deployEmptyContracts();

    await marketDemo(path.resolve(__dirname, '../config/demo-config.json'), contractConfig);

    if (contractConfig && contractConfig.marketLogic) {
        await new ConfigurationClient().add(`${process.env.BACKEND_URL}/api`, 'MarketContractLookup', contractConfig.marketLogic.toLowerCase());
    }
})();
