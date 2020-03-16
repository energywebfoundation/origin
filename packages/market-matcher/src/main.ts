import dotenv from 'dotenv';
import Web3 from 'web3';
import path from 'path';
import program from 'commander';

import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { startMatcher } from '.';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.parse(process.argv);

(async () => {
    dotenv.config({
        path: program.env ? path.resolve(__dirname, program.env) : '../../.env'
    });

    const privateKey = process.env.MATCHER_PRIV_KEY;
    const web3 = new Web3(process.env.WEB3);

    const backendUrl: string = process.env.BACKEND_URL || 'http://localhost';
    const backendPort: number = Number(process.env.BACKEND_PORT) || 3035;

    const matcherInterval = Number(process.env.MATCHER_INTERVAL) || 15;

    const offChainDataSource = new OffChainDataSource(backendUrl, Number(backendPort));

    let storedMarketContractAddress: string;

    console.log(`[MARKET-MATCHER] Trying to get Market contract address`);

    while (!storedMarketContractAddress) {
        storedMarketContractAddress = (await offChainDataSource.configurationClient.get())
            .marketContractLookup;

        if (!storedMarketContractAddress) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

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
        offChainDataSource,
        matcherInterval
    };

    startMatcher(config);
})();
