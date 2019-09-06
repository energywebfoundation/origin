import Web3 = require('web3');
import { deploy } from 'ew-utils-deployment';
import { TransactionReceipt } from 'web3/types';

import { Erc20TestTokenJSON, Erc721TestReceiverJSON } from '..';

export async function deployERC20TestToken(
    web3: Web3,
    testaccount: string,
    deployKey: string,
): Promise<TransactionReceipt> {
    const privateKeyDeployment = deployKey.startsWith('0x') ?
        deployKey : '0x' + deployKey;

    return deploy(
        web3,
        Erc20TestTokenJSON.bytecode +
        web3.eth.abi.encodeParameter('address', testaccount).substr(2),
        { privateKey: privateKeyDeployment },
    );
}

export async function deployERC721TestReceiver(
    web3: Web3,
    erc721TokenContract: string,
    deployKey: string,
): Promise<TransactionReceipt> {
    const privateKeyDeployment = deployKey.startsWith('0x') ?
        deployKey : '0x' + deployKey;

    return deploy(
        web3,
        Erc721TestReceiverJSON.bytecode +
        web3.eth.abi.encodeParameter('address', erc721TokenContract).substr(2),
        { privateKey: privateKeyDeployment },
    );
}
