import { Configuration } from '@energyweb/utils-general';
import Web3 from 'web3';
import { UserLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    userLogicContractAddress: string
): Promise<Configuration.BlockchainProperties> => {
    return {
        userLogicInstance: new UserLogic(web3, userLogicContractAddress),
        web3: web3 as any
    };
};
