import dotenv from 'dotenv';
import Web3 from 'web3';

import { startMatcher } from '.';

dotenv.config({
    path: '../../.env'
});

const privateKey = process.env.MATCHER_PRIV_KEY;
const web3 = new Web3(process.env.WEB3);

console.log({
    web3Url: process.env.WEB3,
    marketContractLookupAddress: process.env.MARKET_CONTRACT_ADDRESS,
    matcherAccount: {
        address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
        privateKey
    },
    offChainDataSourceUrl: process.env.BACKEND_URL
});

const config = {
    web3Url: process.env.WEB3,
    marketContractLookupAddress: process.env.MARKET_CONTRACT_ADDRESS,
    matcherAccount: {
        address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
        privateKey
    },
    offChainDataSourceUrl: process.env.BACKEND_URL
};

startMatcher(config);
