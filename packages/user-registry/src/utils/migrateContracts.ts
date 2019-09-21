import Web3 from 'web3';
import { deploy } from '@energyweb/utils-general';
import { UserContractLookup } from '../wrappedContracts/UserContractLookup';
import UserDBJSON from '../../build/contracts/UserDB.json';
import UserLogicJSON from '../../build/contracts/UserLogic.json';
import { UserContractLookupJSON } from '../../contracts';

export async function migrateUserRegistryContracts(web3: Web3, deployKey: string): Promise<JSON> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const userContractLookupAddress = (await deploy(web3, UserContractLookupJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const userLogicAddress = (await deploy(
        web3,
        UserLogicJSON.bytecode +
            web3.eth.abi.encodeParameter('address', userContractLookupAddress).substr(2),
        { privateKey: privateKeyDeployment }
    )).contractAddress;

    const userDBAddress = (await deploy(
        web3,
        UserDBJSON.bytecode + web3.eth.abi.encodeParameter('address', userLogicAddress).substr(2),
        { privateKey: privateKeyDeployment }
    )).contractAddress;

    const userContractLookup = new UserContractLookup(web3 as any, userContractLookupAddress);
    await userContractLookup.init(userLogicAddress, userDBAddress, {
        privateKey: privateKeyDeployment
    });

    const resultMapping = {} as any;

    resultMapping.UserContractLookup = userContractLookupAddress;
    resultMapping.UserLogic = userLogicAddress;
    resultMapping.UserDB = userDBAddress;

    return resultMapping;
}
