import Web3 from 'web3';
import { deploy } from '@energyweb/utils-general';
import { GeneralFunctions } from '../wrappedContracts/GeneralFunctions';

import UserLogicJSON from '../../build/contracts/UserLogic.json';

export async function migrateUserRegistryContracts(web3: Web3, deployKey: string): Promise<any> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const userLogicAddress = (await deploy(web3, UserLogicJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const userLogic = new web3.eth.Contract(UserLogicJSON.abi, userLogicAddress);

    await new GeneralFunctions(userLogic, web3).send(userLogic.methods.initialize(), {
        privateKey: privateKeyDeployment
    });

    return {
        userLogic: userLogicAddress
    };
}
