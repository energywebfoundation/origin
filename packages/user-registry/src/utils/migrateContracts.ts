import Web3 from 'web3';
import { deploy } from '@energyweb/utils-general';

import { UserLogic } from '../wrappedContracts/UserLogic';
import UserLogicJSON from '../../build/contracts/UserLogic.json';

export async function migrateUserRegistryContracts(
    web3: Web3,
    deployKey: string
): Promise<UserLogic> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const userLogicAddress = (
        await deploy(web3, UserLogicJSON.bytecode, {
            privateKey: privateKeyDeployment
        })
    ).contractAddress;

    const userLogic = new UserLogic(web3, userLogicAddress);
    await userLogic.initialize();

    return userLogic;
}
