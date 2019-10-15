import { assert } from 'chai';
import 'mocha';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { UserLogic } from '@energyweb/user-registry';
import {
    migrateUserRegistryContracts,
} from '@energyweb/user-registry/contracts';
import { AssetContractLookup } from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';

import { migrateCertificateRegistryContracts } from '../utils/migrateContracts';
import { OriginContractLookup } from '../wrappedContracts/OriginContractLookup';
import { CertificateDB } from '../wrappedContracts/CertificateDB';
import { CertificateLogic } from '../wrappedContracts/CertificateLogic';
import { OriginContractLookupJSON, CertificateLogicJSON, CertificateDBJSON } from '../../contracts';

describe('OriginContractLookup', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let certificateLogic: CertificateLogic;
    let certificateDB: CertificateDB;
    let isGanache: boolean;

    it('should deploy the contracts', async () => {
        // isGanache = (await getClientVersion(web3)).includes('EthereumJS');

        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

        const userContractLookupAddr = (userContracts as any).UserContractLookup;

        const assetContracts = await migrateAssetRegistryContracts(
            web3,
            userContractLookupAddr,
            privateKeyDeployment
        );

        const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

        const assetProducingAddr = (assetContracts as any).AssetProducingRegistryLogic;
        const originContracts: any = await migrateCertificateRegistryContracts(
            web3,
            assetRegistryLookupAddr,
            privateKeyDeployment
        );

        assetRegistryContract = new AssetContractLookup(web3, assetRegistryLookupAddr);

        for (const key of Object.keys(originContracts)) {
            let tempBytecode;

            if (key.includes('OriginContractLookup')) {
                originRegistryContract = new OriginContractLookup(web3, originContracts[key]);
                tempBytecode = OriginContractLookupJSON.deployedBytecode;
            }

            if (key.includes('CertificateLogic')) {
                certificateLogic = new CertificateLogic(web3, originContracts[key]);
                tempBytecode = CertificateLogicJSON.deployedBytecode;
            }

            if (key.includes('CertificateDB')) {
                certificateDB = new CertificateDB(web3, originContracts[key]);
                tempBytecode = CertificateDBJSON.deployedBytecode;
            }

            const deployedBytecode = await web3.eth.getCode(originContracts[key]);
            assert.isTrue(deployedBytecode.length > 0);
            assert.equal(deployedBytecode, tempBytecode);
        }
    });

    it('should have the right owner', async () => {
        assert.equal(await originRegistryContract.owner(), accountDeployment);
    });

    it('should have the right registries', async () => {
        assert.equal(
            await originRegistryContract.originLogicRegistry(),
            certificateLogic.web3Contract.options.address
        );
        assert.equal(
            await originRegistryContract.assetContractLookup(),
            assetRegistryContract.web3Contract.options.address
        );
    });

    it('should fail when trying to call init again', async () => {
        let failed = false;

        try {
            await originRegistryContract.init(
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                '0x1000000000000000000000000000000000000005',
                { privateKey: privateKeyDeployment }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'already initialized');
        }
        assert.isTrue(failed);
    });

    it('should throw an error when calling update as non Owner', async () => {
        let failed = false;
        try {
            await originRegistryContract.update('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }
        assert.isTrue(failed);
    });

    it('should be able to update as owner', async () => {
        await originRegistryContract.update('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await originRegistryContract.originLogicRegistry(),
            '0x1000000000000000000000000000000000000005'
        );
        assert.equal(await certificateDB.owner(), '0x1000000000000000000000000000000000000005');
    });

    it('should throw when trying to change owner as non-owner', async () => {
        let failed = false;

        try {
            await originRegistryContract.changeOwner('0x1000000000000000000000000000000000000005', {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'msg.sender is not owner');
        }

        assert.isTrue(failed);
    });

    it('should be able to change owner ', async () => {
        await originRegistryContract.changeOwner('0x1000000000000000000000000000000000000005', {
            privateKey: privateKeyDeployment
        });

        assert.equal(
            await originRegistryContract.owner(),
            '0x1000000000000000000000000000000000000005'
        );
    });
});
