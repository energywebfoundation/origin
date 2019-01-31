import * as EwGeneralLib from 'ew-utils-general-lib';
import * as Winston from 'winston';
import Web3 = require('web3');
import { createBlockchainProperties as userCreateBlockchainProperties} from 'ew-user-registry-lib';
import { AssetContractLookup, AssetConsumingRegistryLogic, AssetProducingRegistryLogic } from 'ew-asset-registry-contracts';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3, 
    assetContractLookupAddress: string,
): Promise<EwGeneralLib.Configuration.BlockchainProperties> => {

    const assetLookupContractInstance: AssetContractLookup = new AssetContractLookup(
        web3,
        assetContractLookupAddress);

    const userBlockchainProperties: EwGeneralLib.Configuration.BlockchainProperties = 
        await userCreateBlockchainProperties(
            logger,
            web3 as any,
            await assetLookupContractInstance.userRegistry(),
        ) as any;
    
    return {
        consumingAssetLogicInstance: new AssetConsumingRegistryLogic(
            web3,
            await assetLookupContractInstance.assetConsumingRegistry(),
        ),
        producingAssetLogicInstance: new AssetProducingRegistryLogic(
            web3, 
            await assetLookupContractInstance.assetProducingRegistry(),
            ),
        userLogicInstance: userBlockchainProperties.userLogicInstance,
        
        web3: web3 as any,
    
    };
};