import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties as assetCreateBlockchainProperties } from '@energyweb/asset-registry';
import { createBlockchainProperties as issuerCreateBlockchainProperties } from '@energyweb/origin';

import { MarketLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    userLogicAddress: string,
    assetLogicAddress: string,
    certificateLogicAddress: string,
    marketLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    if (!web3) {
        return {
            consumingAssetLogicInstance: null,
            marketLogicInstance: null,
            producingAssetLogicInstance: null,
            userLogicInstance: null,
            certificateLogicInstance: null,
            web3: null
        };
    }

    const assetBlockchainProperties: Configuration.BlockchainProperties = await assetCreateBlockchainProperties(
        web3,
        userLogicAddress,
        assetLogicAddress
    );

    const originBlockchainProperties: Configuration.BlockchainProperties = await issuerCreateBlockchainProperties(
        web3,
        userLogicAddress,
        assetLogicAddress,
        certificateLogicAddress
    );

    return {
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        marketLogicInstance: new MarketLogic(web3, marketLogicAddress),
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        certificateLogicInstance: originBlockchainProperties.certificateLogicInstance,
        web3
    };
};
