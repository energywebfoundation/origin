import Web3 from 'web3';
import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    userLogicContractAddress: string
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

    return {
        userLogicInstance: new UserLogic(web3, userLogicContractAddress),
        web3
    };
};
