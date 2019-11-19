import dotenv from 'dotenv';
import Web3 from 'web3';
import { assert } from 'chai';

import { deployERC20TestToken, deployERC721TestReceiver } from '..';
import { Erc20TestToken } from '../wrappedContracts/Erc20TestToken';

describe('deployTests', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = `${deployKey.startsWith('0x') ? '' : '0x'}${deployKey}`;
    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const testAccountPK = '0x9ed06d258a8b6d323b59c5bf8b84876c5bb2ba25af275cfff013eb630aac2bad';
    const testAccount = web3.eth.accounts.privateKeyToAccount(testAccountPK).address;

    it('should deploy the ERC20 Test-Token', async () => {
        const contractAddress = await deployERC20TestToken(web3, testAccount, privateKeyDeployment);
        assert.notEqual(contractAddress, null);
        
        const erc20 = new Erc20TestToken(web3, contractAddress);
        assert.equal(await erc20.balanceOf(testAccount), 1000000);
    });

    it('should deploy the ERC721 receiver contract', async () => {
        const tx = await deployERC721TestReceiver(web3, testAccount, privateKeyDeployment);
        assert.notEqual(tx.contractAddress, null);
    });
});
