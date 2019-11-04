import Web3 from 'web3';
import * as Winston from 'winston';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import { IOffChainDataClient } from '@energyweb/origin-backend-client';

export const initOriginConfig = async (
    marketContractLookup: string,
    web3: Web3,
    offChainDataSourceClient: IOffChainDataClient
): Promise<Configuration.Entity> => {
    const blockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        marketContractLookup
    );

    return {
        blockchainProperties,
        offChainDataSource: {
            baseUrl: `${process.env.BACKEND_URL}/api`,
            client: offChainDataSourceClient
        },
        logger: Winston.createLogger({
            level: 'debug',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };
};
