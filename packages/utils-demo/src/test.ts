import axios from 'axios';
import dotenv from 'dotenv';

import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';

async function main() {
    dotenv.config({
        path: '.env.test'
    });
    const contractConfig = await deployEmptyContracts();

    await marketDemo();

    if (contractConfig && contractConfig.marketContractLookup) {
        await axios.post(`${process.env.BACKEND_URL}/MarketContractLookup/${contractConfig.marketContractLookup.toLowerCase()}`);
    }
}

try {
    main();
} catch (e) {
    console.error(e);
    process.exit(1);
}
