import dotenv from 'dotenv';
import Web3 from 'web3';
import path from 'path';
import program from 'commander';

import {
    OffChainDataClient,
    ConfigurationClient,
    UserClient
} from '@energyweb/origin-backend-client';
import { startMatcher } from '.';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.parse(process.argv);

(async () => {
    dotenv.config({
        path: program.env ? path.resolve(__dirname, program.env) : '../../.env'
    });

    const privateKey = process.env.MATCHER_PRIV_KEY;
    const web3 = new Web3(process.env.WEB3);

    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost:3035';
    const baseUrl = `${backendUrl}/api`;

    const matcherInterval = Number(process.env.MATCHER_INTERVAL) || 15;

    let storedMarketContractAddresses: string[] = [];

    console.log(`[MARKET-MATCHER] Trying to get Market contract address`);

    const configurationClient = new ConfigurationClient();
    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await configurationClient.get(
            baseUrl,
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    console.log(`[MARKET-MATCHER] Starting for Market ${storedMarketContractAddress}`);

    const marketLogicAddress: string =
        process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;

    const config = {
        web3Url: process.env.WEB3,
        marketLogicAddress,
        matcherAccount: {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        },
        offChainDataSourceUrl: baseUrl,
        offChainDataSourceClient: new OffChainDataClient(),
        configurationClient,
        userClient: new UserClient(baseUrl),
        matcherInterval
    };

    startMatcher(config);
})();
