import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import { UserContractLookup, UserLogic } from '@energyweb/user-registry';
import {
    migrateUserRegistryContracts,
} from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '../utils/migrateContracts';
import { AssetContractLookup } from '../wrappedContracts/AssetContractLookup';
import { AssetProducingRegistryLogic } from '../wrappedContracts/AssetProducingRegistryLogic';
import { AssetConsumingRegistryLogic } from '../wrappedContracts/AssetConsumingRegistryLogic';
import { AssetConsumingDB } from '../wrappedContracts/AssetConsumingDB';
import { AssetProducingDB } from '../wrappedContracts/AssetProducingDB';
import {
    AssetContractLookupJSON,
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON
} from '../../contracts';

describe('AssetContractLookup', () => {
    const configFile: any = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3: Web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let userLogic: UserLogic;

    let userContractLookup: UserContractLookup;
    let assetContractLookup: AssetContractLookup;
    let assetProducingLogic: AssetProducingRegistryLogic;
    let assetConsumingLogic: AssetConsumingRegistryLogic;
    let assetProducingDB: AssetProducingDB;
    let assetConsumingDB: AssetConsumingDB;

    it('should deploy the contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(accountDeployment, 3, {
            privateKey: privateKeyDeployment
        });

        const userContractLookupAddr: string = (userContracts as any).UserContractLookup;

        const deployedContracts: any = await migrateAssetRegistryContracts(
            web3,
            userContractLookupAddr,
            privateKeyDeployment
        );

        userContractLookup = new UserContractLookup(web3 as any, userContractLookupAddr);

        Object.keys(deployedContracts).forEach(async key => {
            let tempBytecode;
            if (key.includes('AssetContractLookup')) {
                assetContractLookup = new AssetContractLookup(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetContractLookupJSON as any).deployedBytecode;
            }

            if (key.includes('AssetConsumingDB')) {
                assetConsumingDB = new AssetConsumingDB(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetConsumingDBJSON as any).deployedBytecode;
            }

            if (key.includes('AssetConsumingRegistryLogic')) {
                assetConsumingLogic = new AssetConsumingRegistryLogic(
                    web3 as any,
                    deployedContracts[key]
                );
                tempBytecode = (AssetConsumingRegistryLogicJSON as any).deployedBytecode;
            }

            if (key.includes('AssetProducingDB')) {
                assetProducingDB = new AssetProducingDB(web3 as any, deployedContracts[key]);
                tempBytecode = (AssetProducingDBJSON as any).deployedBytecode;
            }

            if (key.includes('AssetProducingRegistryLogic')) {
                assetProducingLogic = new AssetProducingRegistryLogic(
                    web3 as any,
                    deployedContracts[key]
                );
                tempBytecode = (AssetProducingRegistryLogicJSON as any).deployedBytecode;
            }

            const deployedBytecode = await web3.eth.getCode(deployedContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);

            // const tempBytecode = contractInfo.deployedBytecode;
            assert.equal(deployedBytecode, tempBytecode);
        });
    });

    it('should have the right owner', async () => {
        assert.equal(await userContractLookup.owner(), accountDeployment);
        assert.equal(await assetContractLookup.owner(), accountDeployment);
    });

    it('should have the right registries', async () => {
        assert.equal(
            await assetContractLookup.assetConsumingRegistry(),
            assetConsumingLogic.web3Contract._address
        );
        assert.equal(
            await assetContractLookup.assetProducingRegistry(),
            assetProducingLogic.web3Contract._address
        );
        assert.equal(
            await assetContractLookup.userRegistry(),
            userContractLookup.web3Contract._address
        );
    });

    it('should throw an error when calling init again', async () => {
        let failed = false;

        try {
            await assetContractLookup.init(
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'alreadny initialized');
        }

        assert.isTrue(failed);
    });

    it('should throw an error when calling update as non Owner', async () => {
        let failed = false;

        try {
            await assetContractLookup.update(
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should be able to update as owner', async () => {
        await assetContractLookup.update(
            '0x1000000000000000000000000000000000000005',
            '0x1000000000000000000000000000000000000006',
            { privateKey: privateKeyDeployment }
        );

        assert.equal(
            await assetContractLookup.assetProducingRegistry(),
            '0x1000000000000000000000000000000000000005'
        );
        assert.equal(await assetProducingDB.owner(), '0x1000000000000000000000000000000000000005');

        assert.equal(
            await assetContractLookup.assetConsumingRegistry(),
            '0x1000000000000000000000000000000000000006'
        );
        assert.equal(await assetConsumingDB.owner(), '0x1000000000000000000000000000000000000006');
    });

    it('should throw when trying to change owner as non-owner', async () => {
        let failed = false;

        try {
            await assetContractLookup.changeOwner('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should be able to change owner ', async () => {
        await assetContractLookup.changeOwner('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await assetContractLookup.owner(),
            '0x1000000000000000000000000000000000000005'
        );
    });
});
