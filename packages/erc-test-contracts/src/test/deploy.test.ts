import * as fs from 'fs';
import { assert } from 'chai';
import { deployERC20TestToken, deployERC721TestReceiver } from '..';

import Web3 from 'web3';

describe('deployTests', () => {
    const configFile = JSON.parse(
        fs.readFileSync(`${process.cwd()}/connection-config.json`, 'utf8')
    );
    const web3: Web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : `0x${configFile.develop.deployKey}`;
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
