import { deploy } from '@energyweb/utils-general';
import Web3 from 'web3';

import MarketLogicJSON from '../../build/contracts/MarketLogic.json';

import { MarketLogic } from '../wrappedContracts/MarketLogic';

export async function migrateMarketRegistryContracts(
    web3: Web3,
    certificateLogicAddress: string,
    deployKey: string
): Promise<MarketLogic> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const marketLogicAddress = (await deploy(web3, MarketLogicJSON.bytecode, {
        privateKey: privateKeyDeployment
    })).contractAddress;

    const marketLogic = new MarketLogic(web3, marketLogicAddress);
    await marketLogic.initialize(certificateLogicAddress);

    return marketLogic;
}
