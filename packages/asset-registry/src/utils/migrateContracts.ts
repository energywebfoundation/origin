import Web3 from 'web3';
import { deploy } from '@energyweb/utils-general';

import { AssetLogic } from '../wrappedContracts/AssetLogic';
import AssetLogicJSON from '../../build/contracts/AssetLogic.json';

export async function migrateAssetRegistryContracts(
    web3: Web3,
    userLogicAddress: string,
    deployKey: string
): Promise<AssetLogic> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const assetLogicAddress = (await deploy(web3, AssetLogicJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const assetLogic = new AssetLogic(web3, assetLogicAddress);
    await assetLogic.initialize(userLogicAddress, {
        privateKey: privateKeyDeployment
    });

    return assetLogic;
}
