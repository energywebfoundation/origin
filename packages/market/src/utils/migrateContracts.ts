import * as fs from 'fs';
import * as path from 'path';
import { MarketContractLookup } from '../wrappedContracts/MarketContractLookup';
import Web3 from 'web3';

import { deploy } from '@energyweb/utils-general';
import { MarketContractLookupJSON, MarketLogicJSON, MarketDBJSON } from '../../contracts';

export async function migrateMarketRegistryContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    return new Promise<any>(async (resolve, reject) => {
        const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : '0x' + deployKey;

        const marketContractLookupAddress = (await deploy(web3, MarketContractLookupJSON.bytecode, {
            privateKey: privateKeyDeployment
        })).contractAddress;

        const marketLogicAddress = (await deploy(
            web3,
            MarketLogicJSON.bytecode +
                web3.eth.abi
                    .encodeParameters(
                        ['address', 'address'],
                        [assetContractLookupAddress, marketContractLookupAddress]
                    )
                    .substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const marketDBAddress = (await deploy(
            web3,
            MarketDBJSON.bytecode +
                web3.eth.abi.encodeParameter('address', marketLogicAddress).substr(2),
            { privateKey: privateKeyDeployment }
        )).contractAddress;

        const marketContractLookup = new MarketContractLookup(web3, marketContractLookupAddress);

        await marketContractLookup.init(
            assetContractLookupAddress,
            marketLogicAddress,
            marketDBAddress,
            { privateKey: privateKeyDeployment }
        );

        const resultMapping = {} as any;
        resultMapping.MarketContractLookup = marketContractLookupAddress;
        resultMapping.MarketLogic = marketLogicAddress;
        resultMapping.MarketDB = marketDBAddress;

        resolve(resultMapping);
    });
}
