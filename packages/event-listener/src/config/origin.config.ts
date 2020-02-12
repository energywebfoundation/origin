import Web3 from 'web3';
import * as Winston from 'winston';

import { createBlockchainProperties as marketCreateBlockchainProperties } from '@energyweb/market';
import { Configuration, DeviceTypeService } from '@energyweb/utils-general';

import { IEventListenerConfig } from './IEventListenerConfig';

export const initOriginConfig = async (
    marketContractLookup: string,
    web3: Web3,
    listenerConfig: IEventListenerConfig
): Promise<Configuration.Entity> => {
    const blockchainProperties: Configuration.BlockchainProperties = await marketCreateBlockchainProperties(
        web3,
        marketContractLookup
    );

    blockchainProperties.activeUser = {
        privateKey: listenerConfig.accountPrivKey,
        address: web3.eth.accounts.privateKeyToAccount(listenerConfig.accountPrivKey).address
    };

    return {
        blockchainProperties,
        offChainDataSource: listenerConfig.offChainDataSource,
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        }),
        deviceTypeService: new DeviceTypeService(
            await listenerConfig.offChainDataSource.configurationClient.get('device-types')
        )
    };
};
