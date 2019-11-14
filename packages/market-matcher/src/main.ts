import dotenv from 'dotenv';
import Web3 from 'web3';

import { OffChainDataClient, ConfigurationClient } from '@energyweb/origin-backend-client';
import { startMatcher } from '.';

dotenv.config({
    path: '../../.env'
});

(async () => {
    const privateKey = process.env.MATCHER_PRIV_KEY;
    const web3 = new Web3(process.env.WEB3);

    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost:3035';
    const baseUrl = `${backendUrl}/api`;

    const matcherInterval = Number(process.env.MATCHER_INTERVAL) || 15;

    const storedMarketLogicAddress = (
        await new ConfigurationClient().get(baseUrl, 'MarketContractLookup')
    ).pop();

    const marketLogicAddress: string =
        process.env.MARKET_CONTRACT_ADDRESS || storedMarketLogicAddress;

    const config = {
        web3Url: process.env.WEB3,
        marketLogicAddress,
        matcherAccount: {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        },
        offChainDataSourceUrl: `${process.env.BACKEND_URL}/api`,
        offChainDataSourceClient: new OffChainDataClient(),
        matcherInterval
    };

    startMatcher(config);
})();
