import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '@energyweb/user-registry';

import { AssetLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    assetLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    if (!web3) {
        return {
            marketLogicInstance: null,
            assetLogicInstance: null,
            userLogicInstance: null,
            certificateLogicInstance: null,
            web3: null
        };
    }

    const assetLogicInstance = new AssetLogic(web3, assetLogicAddress);
    const userLogicInstance = new UserLogic(web3, await assetLogicInstance.userLogicAddress());

    return {
        assetLogicInstance,
        userLogicInstance,
        web3
    };
};
