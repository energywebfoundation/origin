import dotenv from 'dotenv';
import Web3 from 'web3';
import { assert } from 'chai';

import { deployERC20TestToken, deployERC721TestReceiver } from '..';

describe('deployTests', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = `${deployKey.startsWith('0x') ? '' : '0x'}${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    it('should deploy the ERC20 Test-Token', async () => {
        const tx = await deployERC20TestToken(web3, accountDeployment, privateKeyDeployment);

        assert.notEqual(tx.contractAddress, null);
    });

    it('should deploy the ERC721 receiver contract', async () => {
        const tx = await deployERC721TestReceiver(web3, accountDeployment, privateKeyDeployment);
        assert.notEqual(tx.contractAddress, null);
    });
});
