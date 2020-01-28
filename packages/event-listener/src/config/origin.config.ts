import Web3 from 'web3';
import * as Winston from 'winston';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSource } from '@energyweb/origin-backend-client';

import { IEventListenerConfig } from './IEventListenerConfig';

export const initOriginConfig = async (
    marketContractLookup: string,
    web3: Web3,
    config: IEventListenerConfig
): Promise<Configuration.Entity> => {
    const blockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        marketContractLookup
    );

    blockchainProperties.activeUser = {
        privateKey: config.accountPrivKey,
        address: web3.eth.accounts.privateKeyToAccount(config.accountPrivKey).address
    };

    const offChainDataSource = new OffChainDataSource(`${process.env.BACKEND_URL}/api`);

    return {
        blockchainProperties,
        offChainDataSource,
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };
};
