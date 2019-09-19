import { deploy } from '@energyweb/utils-general';
import Web3 from 'web3';

import { MarketContractLookupJSON, MarketDBJSON, MarketLogicJSON } from '..';
import { MarketContractLookup } from '../wrappedContracts/MarketContractLookup';

export async function migrateMarketRegistryContracts(
    web3: Web3,
    assetContractLookupAddress: string,
    originContractLookupAddress: string,
    deployKey: string
): Promise<JSON> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const marketContractLookupAddress = (await deploy(web3, MarketContractLookupJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const marketLogicAddress = (await deploy(
        web3,
        MarketLogicJSON.bytecode +
            web3.eth.abi
                .encodeParameters(
                    ['address', 'address'],
                    [
                        assetContractLookupAddress,
                        originContractLookupAddress,
                        marketContractLookupAddress
                    ]
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
        originContractLookupAddress,
        marketLogicAddress,
        marketDBAddress,
        { privateKey: privateKeyDeployment }
    );

    const resultMapping = {} as any;
    resultMapping.MarketContractLookup = marketContractLookupAddress;
    resultMapping.MarketLogic = marketLogicAddress;
    resultMapping.MarketDB = marketDBAddress;

    return resultMapping;
}
