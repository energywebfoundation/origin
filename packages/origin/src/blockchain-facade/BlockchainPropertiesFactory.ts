import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties as assetCreateBlockchainProperties } from '@energyweb/asset-registry';

import { CertificateLogic, OriginContractLookup } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    originContractLookupAddress: string
): Promise<Configuration.BlockchainProperties> => {
    const originLookupContractInstance: OriginContractLookup = new OriginContractLookup(
        web3,
        originContractLookupAddress
    );

    const assetBlockchainProperties: Configuration.BlockchainProperties = await assetCreateBlockchainProperties(
        web3,
        await originLookupContractInstance.assetContractLookup()
    );

    return {
        certificateLogicInstance: new CertificateLogic(
            web3,
            await originLookupContractInstance.originLogicRegistry()
        ),
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        web3
    };
};
