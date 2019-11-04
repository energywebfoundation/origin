import { Configuration } from '@energyweb/utils-general';

import Web3 from 'web3';
import { createBlockchainProperties as userCreateBlockchainProperties } from '@energyweb/user-registry';
import { AssetLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    userLogicAddress: string,
    assetLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    const assetLogicInstance: AssetLogic = new AssetLogic(web3, assetLogicAddress);

    const userBlockchainProperties: Configuration.BlockchainProperties = await userCreateBlockchainProperties(
        web3,
        userLogicAddress
    );

    return {
        producingAssetLogicInstance: assetLogicInstance,
        userLogicInstance: userBlockchainProperties.userLogicInstance,
        web3: web3 as any
    };
};
