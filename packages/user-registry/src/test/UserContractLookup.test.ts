import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import { migrateUserRegistryContracts } from '../utils/migrateContracts';
import { UserContractLookup } from '../wrappedContracts/UserContractLookup';
import { UserLogic } from '../wrappedContracts/UserLogic';
import { UserDB } from '../wrappedContracts/UserDB';
import { UserContractLookupJSON, UserLogicJSON, UserDBJSON } from '../../contracts';

describe('UserContractLookup', () => {
    const configFile: any = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );
    // const configFile = JSON.parse(fs.readFileSync('connection-config.json', 'utf8'));

    const web3: Web3 = new Web3(configFile.develop.web3);

    let userContractLookup: UserContractLookup;
    let userRegistry: UserLogic;
    let userDB: UserDB;

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    it('should deploy the contracts', async () => {
        const contracts: any = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        let numberContracts = 0;

        for (const key of Object.keys(contracts)) {
            numberContracts += 1;

            let tempBytecode;
            if (key.includes('UserContractLookup')) {
                userContractLookup = new UserContractLookup(web3 as any, contracts[key]);
                tempBytecode = (UserContractLookupJSON as any).deployedBytecode;
            } else if (key.includes('UserLogic')) {
                userRegistry = new UserLogic(web3 as any, contracts[key]);
                tempBytecode = (UserLogicJSON as any).deployedBytecode;
            } else if (key.includes('UserDB')) {
                userDB = new UserDB(web3 as any, contracts[key]);
                tempBytecode = (UserDBJSON as any).deployedBytecode;
            }
            const deployedBytecode = await web3.eth.getCode(contracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            assert.equal(deployedBytecode, tempBytecode);
        }

        assert.equal(numberContracts, 3);
    });

    it('should have the right owner', async () => {
        assert.equal(await userContractLookup.owner(), accountDeployment);
    });

    it('should have the right userRegistry', async () => {
        assert.equal(await userContractLookup.userRegistry(), userRegistry.web3Contract.options.address);
    });

    it('should throw an error when calling init again', async () => {
        let failed = false;

        try {
            await userContractLookup.init(
                userRegistry.web3Contract.options.address,
                userRegistry.web3Contract.options.address,
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            assert.include(ex.message, 'already initialized');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should throw an error when calling update as non Owner', async () => {
        let failed = false;

        try {
            await userContractLookup.update('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            assert.include(ex.message, 'msg.sender is not owner');
            failed = true;
        }

        assert.isTrue(failed);
    });

    it('should be able to update as owner', async () => {
        await userContractLookup.update('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await userContractLookup.userRegistry(),
            '0x1000000000000000000000000000000000000005'
        );
        assert.equal(await userDB.owner(), '0x1000000000000000000000000000000000000005');
    });

    it('should throw when trying to change owner as non-owner', async () => {
        let failed = false;

        try {
            await userContractLookup.changeOwner('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should be able to change owner ', async () => {
        await userContractLookup.changeOwner('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await userContractLookup.owner(),
            '0x1000000000000000000000000000000000000005'
        );
    });
});
