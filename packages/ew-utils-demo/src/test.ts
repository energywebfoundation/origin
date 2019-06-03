import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';
import * as fetch from 'node-fetch';
import { CONFIG } from './config';

async function main() {
    const contractConfig = await deployEmptyContracts();

    // you could either use the default config file "demo-config.json"
    await marketDemo();

    if (contractConfig && contractConfig.originContractLookup) {
       fetch(`${CONFIG.API_BASE_URL}/OriginContractLookupMarketLookupMapping/${contractConfig.originContractLookup.toLowerCase()}`, {
           body: JSON.stringify({
               marketContractLookup: contractConfig.marketContractLookup.toLowerCase(),
           }),
           method: 'PUT',
           headers: {
               'Content-Type': 'application/json',
           }
       });
   }
}

main();
