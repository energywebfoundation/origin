import { Configuration } from '@energyweb/utils-general';
import Web3 from 'web3';
import { createBlockchainProperties as assetCreateBlockchainProperties } from '@energyweb/asset-registry';
import { createBlockchainProperties as issuerCreateBlockchainProperties } from '@energyweb/origin';
import { MarketContractLookup, MarketLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    marketContractLookupAddress: string
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

    const marketLookupContractInstance: MarketContractLookup = new MarketContractLookup(
        web3,
        marketContractLookupAddress
    );

    const assetBlockchainProperties: Configuration.BlockchainProperties = await assetCreateBlockchainProperties(
        web3,
        await marketLookupContractInstance.assetContractLookup()
    );

    const originBlockchainProperties: Configuration.BlockchainProperties = await issuerCreateBlockchainProperties(
        web3,
        await marketLookupContractInstance.originContractLookup()
    );

    return {
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        marketLogicInstance: new MarketLogic(
            web3,
            await marketLookupContractInstance.marketLogicRegistry()
        ),
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        certificateLogicInstance: originBlockchainProperties.certificateLogicInstance,
        web3
    };
};
