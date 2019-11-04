import dotenv from 'dotenv';
import Web3 from 'web3';
import axios, { AxiosResponse } from 'axios';

import { OffChainDataClient } from '@energyweb/origin-backend-client';
import { startMatcher } from '.';

dotenv.config({
    path: '../../.env'
});

(async () => {
    const privateKey = process.env.MATCHER_PRIV_KEY;
    const web3 = new Web3(process.env.WEB3);

    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost:3035';

    const result: AxiosResponse = await axios.get(`${backendUrl}/api/MarketContractLookup`);

    const marketContractLookupAddress: string =
        process.env.MARKET_CONTRACT_ADDRESS || result.data.pop();

    const config = {
        web3Url: process.env.WEB3,
        marketContractLookupAddress,
        matcherAccount: {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        },
        offChainDataSourceUrl: `${process.env.BACKEND_URL}/api`,
        offChainDataSourceClient: new OffChainDataClient()
    };

    startMatcher(config);
})();
