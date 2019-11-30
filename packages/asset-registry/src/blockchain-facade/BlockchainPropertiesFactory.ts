import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '@energyweb/user-registry';

import { DeviceLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    deviceLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    if (!web3) {
        return {
            deviceLogicInstance: null,
            userLogicInstance: null,
            web3: null
        };
    }

    const deviceLogicInstance = new DeviceLogic(web3, deviceLogicAddress);
    const userLogicInstance = new UserLogic(web3, await deviceLogicInstance.userLogicAddress());

    return {
        deviceLogicInstance,
        userLogicInstance,
        web3
    };
};
