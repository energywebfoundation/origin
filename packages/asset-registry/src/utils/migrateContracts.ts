import Web3 from 'web3';

import { AssetContractLookup } from '../wrappedContracts/AssetContractLookup';
import { deploy } from '@energyweb/utils-general';
import {
    AssetContractLookupJSON,
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON
} from '../../contracts';

export async function migrateAssetRegistryContracts(
    web3: Web3,
    userContractLookup: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;
        const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment)
            .address;

        const assetContractLookupAddress = (await deploy(
            web3,
            (AssetContractLookupJSON as any).bytecode,
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetConsumingLogicAddress = (await deploy(
            web3,
            (AssetConsumingRegistryLogicJSON as any).bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [userContractLookup, assetContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetConsumingDBAddress = (await deploy(
            web3,
            (AssetConsumingDBJSON as any).bytecode +
                web3.eth.abi.encodeParameter('address', assetConsumingLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetProducingLogicAddress = (await deploy(
            web3,
            (AssetProducingRegistryLogicJSON as any).bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [userContractLookup, assetContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetProducingDBAddress = (await deploy(
            web3,
            (AssetProducingDBJSON as any).bytecode +
                web3.eth.abi.encodeParameter('address', assetProducingLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const assetContractLookup: AssetContractLookup = new AssetContractLookup(
            web3 as any,
            assetContractLookupAddress
        );

        await assetContractLookup.init(
            userContractLookup,
            assetProducingLogicAddress,
            assetConsumingLogicAddress,
            assetProducingDBAddress,
            assetConsumingDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;

        resultMapping.AssetContractLookup = assetContractLookupAddress;
        resultMapping.AssetConsumingRegistryLogic = assetConsumingLogicAddress;
        resultMapping.AssetConsumingDB = assetConsumingDBAddress;
        resultMapping.AssetProducingRegistryLogic = assetProducingLogicAddress;
        resultMapping.AssetProducingDB = assetProducingDBAddress;

        resolve(resultMapping);
    });
}
