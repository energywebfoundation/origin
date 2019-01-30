import * as EwGeneralLib from 'ew-utils-general-lib';
import * as Winston from 'winston';
import Web3 = require('web3');
import { UserContractLookupJSON, UserContractLookup, UserLogic } from 'ew-user-registry-contracts';

export const createBlockchainProperties = async (
    logger: Winston.Logger,
    web3: Web3, 
    userLookupContractAddress: string,
): Promise<EwGeneralLib.BlockchainProperties> => {

    const userLookupContractInstance: any = new UserContractLookup(web3, userLookupContractAddress);
    const userRegistryLogicAddress: string = await userLookupContractInstance.userRegistry();
    
    return {
        userLogicInstance: new UserLogic(web3, userRegistryLogicAddress),
        web3: web3 as any,
    
    };
};