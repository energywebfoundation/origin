import dotenv from 'dotenv';

import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';
import { ConfigurationClient } from '@energyweb/origin-backend-client';

async function main() {
    dotenv.config({
        path: '.env.test'
    });
    const contractConfig = await deployEmptyContracts();

    await marketDemo();

    if (contractConfig && contractConfig.marketContractLookup) {
        await new ConfigurationClient().add(`${process.env.BACKEND_URL}/api`, 'MarketContractLookup', contractConfig.marketContractLookup.toLowerCase());
    }
}

try {
    main();
} catch (e) {
    console.error(e);
    process.exit(1);
}
