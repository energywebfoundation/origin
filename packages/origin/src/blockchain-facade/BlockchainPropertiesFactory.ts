import Web3 from 'web3';

import { Configuration } from '@energyweb/utils-general';
import { UserLogic } from '@energyweb/user-registry';
import { DeviceLogic } from '@energyweb/asset-registry';

import { CertificateLogic } from '..';

export const createBlockchainProperties = async (
    web3: Web3,
    certificateLogicAddress: string
): Promise<Configuration.BlockchainProperties> => {
    if (!web3) {
        return {
            deviceLogicInstance: null,
            userLogicInstance: null,
            certificateLogicInstance: null,
            web3: null
        };
    }

    const certificateLogicInstance = new CertificateLogic(web3, certificateLogicAddress);
    const deviceLogicInstance = new DeviceLogic(web3, await certificateLogicInstance.deviceLogicAddress());
    const userLogicInstance = new UserLogic(web3, await deviceLogicInstance.userLogicAddress());

    return {
        deviceLogicInstance,
        userLogicInstance,
        certificateLogicInstance,
        web3
    };
};
