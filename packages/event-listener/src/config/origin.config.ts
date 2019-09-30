import axios from 'axios';
import Web3 from 'web3';
import * as Winston from 'winston';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import { createBlockchainProperties } from '@energyweb/origin';
import { Configuration } from '@energyweb/utils-general';

export const initOriginConfig = async (
    originLookupAddress: string,
    web3: Web3
): Promise<Configuration.Entity> => {
    const blockchainProperties: Configuration.BlockchainProperties = await createBlockchainProperties(
        web3,
        originLookupAddress
    );

    const response = await axios.get(
        `${
            process.env.API_BASE_URL
        }/OriginContractLookupMarketLookupMapping/${originLookupAddress.toLowerCase()}`
    );

    const marketBlockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        response.data.marketContractLookup
    );

    blockchainProperties.marketLogicInstance = marketBlockchainProperties.marketLogicInstance;

    return {
        blockchainProperties,
        offChainDataSource: {
            baseUrl: process.env.API_BASE_URL
        },
        logger: Winston.createLogger({
            level: 'debug',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };
};
