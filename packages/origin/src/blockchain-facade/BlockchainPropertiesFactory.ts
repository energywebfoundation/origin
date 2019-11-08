import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '@energyweb/user-registry';
import { AssetLogic } from '@energyweb/asset-registry';

import { CertificateLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    certificateLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    if (!web3) {
        return {
            assetLogicInstance: null,
            userLogicInstance: null,
            certificateLogicInstance: null,
            web3: null
        };
    }

    const certificateLogicInstance = new CertificateLogic(web3, certificateLogicAddress);
    const assetLogicInstance = new AssetLogic(web3, await certificateLogicInstance.assetLogicAddress());
    const userLogicInstance = new UserLogic(web3, await assetLogicInstance.userLogicAddress());

    return {
        assetLogicInstance,
        userLogicInstance,
        certificateLogicInstance,
        web3
    };
};
