import * as EwGeneralLib from 'ew-utils-general-lib';
import * as Winston from 'winston';
import Web3 = require('web3');
import { createBlockchainProperties as assetCreateBlockchainProperties} from 'ew-asset-registry-lib';
import { CertificateLogic, OriginContractLookup} from 'ew-origin-contracts';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3, 
    originContractLookupAddress: string,
): Promise<EwGeneralLib.Configuration.BlockchainProperties> => {

    const originLookupContractInstance: OriginContractLookup = new OriginContractLookup(
        web3,
        originContractLookupAddress);

    const assetBlockchainProperties: EwGeneralLib.Configuration.BlockchainProperties = 
        await assetCreateBlockchainProperties(
            logger,
            web3 as any,
            await originLookupContractInstance.assetContractLookup(),
        ) as any;
    
    return {
        certificateLogicInstance: new CertificateLogic(web3, await originLookupContractInstance.originLogicRegistry()),
        consumingAssetLogicInstance: assetBlockchainProperties.consumingAssetLogicInstance,
        producingAssetLogicInstance: assetBlockchainProperties.producingAssetLogicInstance,
        userLogicInstance: assetBlockchainProperties.userLogicInstance,
        
        web3: web3 as any,
    
    };
};