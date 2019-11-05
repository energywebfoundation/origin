import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties as assetCreateBlockchainProperties } from '@energyweb/asset-registry';

import { CertificateLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    userLogicAddress: string,
    assetLogicAddress: string,
    certificateLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    const certificateLogicInstance = new CertificateLogic(
        web3,
        certificateLogicAddress
    );

    const assetBlockchainProperties = await assetCreateBlockchainProperties(
        web3,
        userLogicAddress,
        assetLogicAddress
    );

    return {
        certificateLogicInstance,
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        web3
    };
};
