import Web3 from 'web3';
import { deploy } from '@energyweb/utils-general';

import { DeviceLogic } from '../wrappedContracts/DeviceLogic';
import DeviceLogicJSON from '../../build/contracts/DeviceLogic.json';

export async function migrateDeviceRegistryContracts(
    web3: Web3,
    userLogicAddress: string,
    deployKey: string
): Promise<DeviceLogic> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const deviceLogicAddress = (await deploy(web3, DeviceLogicJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const deviceLogic = new DeviceLogic(web3, deviceLogicAddress);
    await deviceLogic.initialize(userLogicAddress, {
        privateKey: privateKeyDeployment
    });

    return deviceLogic;
}
