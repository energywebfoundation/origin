import * as EwGeneralLib from 'ew-utils-general-lib';
import * as Winston from 'winston';
import Web3 = require('web3');
import { createBlockchainProperties as assetCreateBlockchainProperties} from 'ew-asset-registry-lib';
import { MarketContractLookup, MarketLogic} from 'ew-market-contracts';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3, 
    marketContractLookupAddress: string,
): Promise<EwGeneralLib.Configuration.BlockchainProperties> => {

    const marketLookupContractInstance: MarketContractLookup = new MarketContractLookup(
        web3,
        marketContractLookupAddress);

    const assetBlockchainProperties: EwGeneralLib.Configuration.BlockchainProperties = 
        await assetCreateBlockchainProperties(
            logger,
            web3 as any,
            await marketLookupContractInstance.assetContractLookup(),
        ) as any;
    
    return {
        
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        marketLogicInstance: new MarketLogic(web3, await marketLookupContractInstance.marketLogicRegistry()),
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        web3: web3 as any,

    
    };
};