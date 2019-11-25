import Web3 from 'web3';

import { deploy } from '@energyweb/utils-general';
import { Erc20TestToken } from '../wrappedContracts/Erc20TestToken';

import Erc20TestTokenJSON from '../../build/contracts/Erc20TestToken.json';

export async function deployERC20TestToken(
    web3: Web3,
    testAccount: string,
    deployKey: string
): Promise<string> {
    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const tx = await deploy(
        web3,
        Erc20TestTokenJSON.bytecode +
            web3.eth.abi.encodeParameter('address', testAccount).substr(2),
        { privateKey: privateKeyDeployment }
    );

    const { contractAddress } = tx;

    const erc20 = new Erc20TestToken(web3, contractAddress);
    await erc20.initialize(testAccount, {
        privateKey: privateKeyDeployment
    });

    return contractAddress;
}
