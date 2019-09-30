import axios from 'axios';
import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';
import { CONFIG } from './config';

async function main() {
    const contractConfig = await deployEmptyContracts();

    await marketDemo();

    if (contractConfig && contractConfig.marketContractLookup) {
        await axios.put(
            `${CONFIG.API_BASE_URL}/MarketContractLookup`,
            { address: contractConfig.marketContractLookup.toLowerCase() }
        );
    }
}

try {
    main();
} catch (e) {
    console.error(e);
    process.exit(1);
}
