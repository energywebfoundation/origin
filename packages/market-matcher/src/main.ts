import dotenv from 'dotenv';

import { startMatcher } from '.';

dotenv.config();

const config = {
    web3Url: process.env.WEB3,
    marketContractLookupAddress: process.env.MARKET_CONTRACT_ADDRESS,
    matcherAccount: {
        address: process.env.MATCHER_PUB_KEY,
        privateKey: process.env.MATCHER_PRIV_KEY
    },
    offChainDataSourceUrl: process.env.BACKEND_URL
};

startMatcher(config);
