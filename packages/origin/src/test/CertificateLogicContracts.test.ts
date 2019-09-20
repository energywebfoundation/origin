// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

import { assert } from 'chai';
import * as fs from 'fs';
import 'mocha';
import Web3 from 'web3';
import moment from 'moment';

import {
    migrateUserRegistryContracts,
    UserLogic,
    UserContractLookup,
    buildRights,
    Role
} from '@energyweb/user-registry';
import {
    migrateAssetRegistryContracts,
    AssetContractLookup,
    AssetProducingRegistryLogic
} from '@energyweb/asset-registry';
import { deploy } from '@energyweb/utils-general';
import {
    TestReceiver,
    Erc20TestToken,
    Erc20TestTokenJSON,
    Erc721TestReceiverJSON
} from '@energyweb/erc-test-contracts';

import { migrateCertificateRegistryContracts } from '../utils/migrateContracts';
import { OriginContractLookup } from '../wrappedContracts/OriginContractLookup';
import { CertificateDB } from '../wrappedContracts/CertificateDB';
import { CertificateLogic } from '../wrappedContracts/CertificateLogic';
import { OriginContractLookupJSON, CertificateLogicJSON, CertificateDBJSON } from '..';
import * as Certificate from '../blockchain-facade/Certificate';

describe('CertificateLogic', () => {
    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let certificateLogic: CertificateLogic;
    let certificateDB: CertificateDB;
    // let isGanache: boolean;
    let userRegistryContract: UserContractLookup;
    let assetRegistry: AssetProducingRegistryLogic;
    let userLogic: UserLogic;
    let testreceiver: TestReceiver;
    let erc20Test: Erc20TestToken;

    let erc721testReceiverAddress;

    const configFile = JSON.parse(
        fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8')
    );

    const web3: Web3 = new Web3(configFile.develop.web3);

    const privateKeyDeployment = configFile.develop.deployKey.startsWith('0x')
        ? configFile.develop.deployKey
        : '0x' + configFile.develop.deployKey;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const assetSmartmeterPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const approvedPK = '0x60a0dae29ff80793b6cc1602f60fbe548b6787d0f9d4eb7c0967dac8ff11591a';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    describe('init checks', () => {
        it('should deploy the contracts', async () => {
            // isGanache = (await getClientVersion(web3)).includes('EthereumJS');

            const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

            userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                accountDeployment,
                'admin',
                { privateKey: privateKeyDeployment }
            );
            await userLogic.setRoles(
                accountDeployment,
                buildRights([Role.UserAdmin, Role.AssetAdmin]),
                { privateKey: privateKeyDeployment }
            );

            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                matcherAccount,
                'matcher',
                { privateKey: privateKeyDeployment }
            );
            await userLogic.setRoles(
                matcherAccount,
                buildRights([Role.Matcher]),
                { privateKey: privateKeyDeployment }
            );

            const userContractLookupAddr = (userContracts as any).UserContractLookup;

            userRegistryContract = new UserContractLookup(web3 as any, userContractLookupAddr);
            const assetContracts = await migrateAssetRegistryContracts(
                web3,
                userContractLookupAddr,
                privateKeyDeployment
            );

            const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

            const assetProducingAddr = (assetContracts as any).AssetProducingRegistryLogic;
            const originContracts = await migrateCertificateRegistryContracts(
                web3,
                assetRegistryLookupAddr,
                privateKeyDeployment
            );

            assetRegistryContract = new AssetContractLookup(web3, assetRegistryLookupAddr);
            assetRegistry = new AssetProducingRegistryLogic(web3, assetProducingAddr);

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

        it('should deploy a testtoken contracts', async () => {
            erc721testReceiverAddress = (await deploy(
                web3,
                Erc721TestReceiverJSON.bytecode +
                    web3.eth.abi
                        .encodeParameter('address', certificateLogic.web3Contract.options.address)
                        .substr(2),
                {
                    privateKey: privateKeyDeployment
                }
            )).contractAddress;

            const erc20testContractAddress = (await deploy(
                web3,
                Erc20TestTokenJSON.bytecode +
                    web3.eth.abi.encodeParameter('address', accountTrader).substr(2),
                {
                    privateKey: privateKeyDeployment
                }
            )).contractAddress;

            testreceiver = new TestReceiver(web3, erc721testReceiverAddress);

            erc20Test = new Erc20TestToken(web3, erc20testContractAddress);
        });

        it('should have the right owner', async () => {
            assert.equal(
                await certificateLogic.owner(),
                originRegistryContract.web3Contract._address
            );
        });

        it('should have the lookup-contracts', async () => {
            assert.equal(
                await certificateLogic.assetContractLookup(),
                assetRegistryContract.web3Contract._address
            );
            assert.equal(
                await certificateLogic.userContractLookup(),
                userRegistryContract.web3Contract._address
            );
        });

        it('should the correct DB', async () => {
            assert.equal(await certificateLogic.db(), certificateDB.web3Contract._address);
        });

        it('should have balances of 0', async () => {
            assert.equal(await certificateLogic.balanceOf(accountDeployment), 0);
            assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 0);
            assert.equal(await certificateLogic.balanceOf(accountTrader), 0);
        });

        it('should throw for balance of address 0x0', async () => {
            let failed = false;
            try {
                await certificateLogic.balanceOf('0x0000000000000000000000000000000000000000');
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to access a non existing certificate', async () => {
            let failed = false;
            try {
                await certificateLogic.ownerOf(0);
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call safeTransferFrom a non existing certificate', async () => {
            let failed = false;
            try {
                await certificateLogic.safeTransferFrom(
                    accountDeployment,
                    accountTrader,
                    0,
                    '0x00',
                    { privateKey: privateKeyDeployment }
                );
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call safeTransferFrom a non existing certificate', async () => {
            let failed = false;
            try {
                await certificateLogic.safeTransferFrom(accountDeployment, accountTrader, 0, {
                    privateKey: privateKeyDeployment
                });
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call transferFrom a non existing certificate', async () => {
            let failed = false;
            try {
                await certificateLogic.transferFrom(accountDeployment, accountTrader, 0, {
                    privateKey: privateKeyDeployment
                });
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call approve a non existing certificate', async () => {
            let failed = false;
            try {
                await certificateLogic.approve(accountTrader, 0, {
                    privateKey: privateKeyDeployment
                });
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should set right roles to users', async () => {
            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                accountTrader,
                'trader',
                { privateKey: privateKeyDeployment }
            );
            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                accountAssetOwner,
                'assetOwner',
                { privateKey: privateKeyDeployment }
            );
            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                testreceiver.web3Contract._address,
                'testreceiver',
                { privateKey: privateKeyDeployment }
            );

            await userLogic.setRoles(
                testreceiver.web3Contract._address,
                buildRights([Role.Trader]),
                {
                    privateKey: privateKeyDeployment
                }
            );
            await userLogic.setRoles(accountTrader, buildRights([Role.Trader]), {
                privateKey: privateKeyDeployment
            });
            await userLogic.setRoles(
                accountAssetOwner,
                buildRights([Role.AssetManager, Role.Trader]),
                { privateKey: privateKeyDeployment }
            );

            await userLogic.createUser(
                'propertiesDocumentHash',
                'documentDBURL',
                issuerAccount,
                'issuer',
                { privateKey: privateKeyDeployment }
            );

            await userLogic.setRoles(issuerAccount, buildRights([Role.Issuer]), {
                privateKey: privateKeyDeployment
            });
        });

        it('should onboard an asset', async () => {
            await assetRegistry.createAsset(
                assetSmartmeter,
                accountAssetOwner,
                true,
                'propertiesDocumentHash',
                'url',
                2,
                { privateKey: privateKeyDeployment }
            );
        });

        it('should set MarketLogicAddress', async () => {
            await assetRegistry.setMarketLookupContract(
                0,
                originRegistryContract.web3Contract._address,
                { privateKey: assetOwnerPK }
            );

            assert.equal(
                await assetRegistry.getMarketLookupContract(0),
                originRegistryContract.web3Contract._address
            );
        });

        it('should return right interface', async () => {
            assert.isTrue(await certificateLogic.supportsInterface('0x80ac58cd'));
            assert.isFalse(await certificateLogic.supportsInterface('0x80ac58c1'));
        });

        describe('transferFrom', () => {
            it('should have 0 certificates', async () => {
                assert.equal(await certificateLogic.getCertificateListLength(), 0);
            });

            it('should log energy', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    100,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 0, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(0, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '0',
                    2: '100',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '0',
                    _newMeterRead: '100',
                    _timestamp: TIMESTAMP.toString()
                });

                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1, 'allTransferEvents length should be 1');

                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '0',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '0'
                });
            });

            it('should have 1 certificate', async () => {
                assert.equal(await certificateLogic.getCertificateListLength(), 1);
            });

            it('should return the certificate', async () => {
                const cert = await certificateLogic.getCertificate(0);
                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 0);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should hava balance of 1 for assetOwner address', async () => {
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 1);
            });

            it('should return the correct owner', async () => {
                assert.equal(await certificateLogic.ownerOf(0), accountAssetOwner);
            });

            it('should return correct approvedFor', async () => {
                assert.equal(
                    await certificateLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return correct isApprovedForAll', async () => {
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, accountDeployment)
                );
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, accountTrader)
                );
            });

            it('should split the certificate', async () => {
                const tx = await certificateLogic.splitCertificate(0, 40, {
                    privateKey: assetOwnerPK
                });

                assert.equal(await certificateLogic.getCertificateListLength(), 3);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);

                // Parent
                const certParent = await certificateLogic.getCertificate(0);
                const certificateSpecificParent = certParent.certificateSpecific;

                assert.equal(certificateSpecificParent.status, Certificate.Status.Split);
                assert.equal(certificateSpecificParent.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecificParent.parentId, 0);
                assert.equal(certificateSpecificParent.children.length, 2);
                assert.equal(certificateSpecificParent.maxOwnerChanges, 2);
                assert.equal(certificateSpecificParent.ownerChangeCounter, 0);

                const tradableEntityParent = certParent.tradableEntity;
                assert.equal(tradableEntityParent.assetId, 0);
                assert.equal(tradableEntityParent.owner, accountAssetOwner);
                assert.equal(tradableEntityParent.powerInW, 100);
                assert.equal(
                    tradableEntityParent.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntityParent.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntityParent.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                // child 1
                const certChildOne = await certificateLogic.getCertificate(1);
                const certificateSpecificChildOne = certChildOne.certificateSpecific;
                assert.equal(certificateSpecificChildOne.status, Certificate.Status.Active);
                assert.equal(certificateSpecificChildOne.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecificChildOne.parentId, 0);
                assert.equal(certificateSpecificChildOne.children.length, 0);
                assert.equal(certificateSpecificChildOne.maxOwnerChanges, 2);
                assert.equal(certificateSpecificChildOne.ownerChangeCounter, 0);

                const tradableEntityChildOne = certChildOne.tradableEntity;
                assert.equal(tradableEntityChildOne.assetId, 0);
                assert.equal(tradableEntityChildOne.owner, accountAssetOwner);
                assert.equal(tradableEntityChildOne.powerInW, 40);
                assert.equal(
                    tradableEntityChildOne.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntityChildOne.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntityChildOne.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                // child 2
                const certChildTwo = await certificateLogic.getCertificate(2);
                const certificateSpecificChildTwo = certChildTwo.certificateSpecific;
                assert.equal(certificateSpecificChildTwo.status, Certificate.Status.Active);
                assert.equal(certificateSpecificChildTwo.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecificChildTwo.parentId, 0);
                assert.equal(certificateSpecificChildTwo.children.length, 0);
                assert.equal(certificateSpecificChildTwo.maxOwnerChanges, 2);
                assert.equal(certificateSpecificChildTwo.ownerChangeCounter, 0);

                const tradableEntityChildTwo = certChildTwo.tradableEntity;
                assert.equal(tradableEntityChildTwo.assetId, 0);
                assert.equal(tradableEntityChildTwo.owner, accountAssetOwner);
                assert.equal(tradableEntityChildTwo.powerInW, 60);
                assert.equal(
                    tradableEntityChildTwo.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntityChildTwo.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntityChildTwo.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 2);

                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '1',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '1'
                });

                assert.equal(allTransferEvents[1].event, 'Transfer');
                assert.deepEqual(allTransferEvents[1].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '2',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '2'
                });

                const certSplittedEvent = await certificateLogic.getAllLogCertificateSplitEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });
                assert.equal(certSplittedEvent.length, 1);

                assert.equal(certSplittedEvent[0].event, 'LogCertificateSplit');
                assert.deepEqual(certSplittedEvent[0].returnValues, {
                    0: '0',
                    1: '1',
                    2: '2',
                    _certificateId: '0',
                    _childOne: '1',
                    _childTwo: '2'
                });
                //    }
            });

            it('should throw when trying to call transferFrom as an admin that does not own that', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 1, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom as an trader that does not own that', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 1, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom using wrong _from', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountDeployment, accountTrader, 1, {
                        privateKey: assetOwnerPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the owner of the entity');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom as an admin on a split certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 0, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom as an trader on a split certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 0, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom on a split certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 0, {
                        privateKey: assetOwnerPK
                    });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should be able to do transferFrom', async () => {
                //       await certificateLogic.approve(accountAssetOwner, 1, { privateKey: assetOwnerPK });

                const tx = await certificateLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    1,
                    { privateKey: assetOwnerPK }
                );

                assert.equal(await certificateLogic.getCertificateListLength(), 3);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);

                //   if (isGanache) {
                const allEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allEvents.length, 1);
                assert.equal(allEvents[0].event, 'Transfer');
                assert.deepEqual(allEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: accountTrader,
                    2: '1',
                    _from: accountAssetOwner,
                    _to: accountTrader,
                    _tokenId: '1'
                });
                //  }
            });

            it('should return the certificate', async () => {
                const cert = await certificateLogic.getCertificate(1);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 0);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 40);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should be able to transfer the certificate a 2nd time', async () => {
                //       await certificateLogic.approve(accountAssetOwner, 1, { privateKey: assetOwnerPK });

                const tx = await certificateLogic.transferFrom(accountTrader, accountTrader, 1, {
                    privateKey: traderPK
                });

                assert.equal(await certificateLogic.getCertificateListLength(), 3);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);

                // if (isGanache) {
                const allEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allEvents.length, 1);
                assert.equal(allEvents[0].event, 'Transfer');
                assert.deepEqual(allEvents[0].returnValues, {
                    0: accountTrader,
                    1: accountTrader,
                    2: '1',
                    _from: accountTrader,
                    _to: accountTrader,
                    _tokenId: '1'
                });
                //  }
            });

            it('should retire a certificate', async () => {
                const tx = await certificateLogic.retireCertificate(1, {
                    privateKey: traderPK
                });

                const retireEvent = await certificateLogic.getAllLogCertificateRetiredEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(retireEvent.length, 1);
                assert.equal(retireEvent[0].event, 'LogCertificateRetired');
                assert.deepEqual(retireEvent[0].returnValues, {
                    0: '1',
                    _certificateId: '1'
                });
            });

            it('should return the certificate (should have retired it)', async () => {
                const cert = await certificateLogic.getCertificate(1);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Retired);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 0);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 40);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call transferFrom on a retired certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountTrader, accountTrader, 1, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call split on a retired certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.splitCertificate(1, 20, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom on a splitted certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountTrader, accountTrader, 0, {
                        privateKey: assetOwnerPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the owner of the entity');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call split on a splitted certificate', async () => {
                let failed = false;
                try {
                    await certificateLogic.splitCertificate(0, 20, { privateKey: assetOwnerPK });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });
        });

        describe('saveTransferFrom without data', () => {
            it('should log energy again (certificate #3)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    200,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 1, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(1, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '100',
                    2: '200',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '100',
                    _newMeterRead: '200',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '3',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '3'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 4);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    0
                );
            });

            it('should return the certificate #3', async () => {
                const cert = await certificateLogic.getCertificate(3);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 3);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safetransferFrom as non owner(admin) and wrong receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        '',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'revert simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner (trader) and wrong receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        '',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as assetManager and wrong receiver ', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        '',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner(admin) and correct receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        3,
                        '',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'revert simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner (trader) and correct receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        3,
                        '',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as owner and regular account', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        '',
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                    //   assert.include(ex.message, "simpleTransfer, missing rights")
                    console.log(ex.message);
                    assert.include(ex.message, '_to is not a contract');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as owner random contract', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        certificateLogic.web3Contract._address,
                        3,
                        '',
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                    //   assert.include(ex.message, "simpleTransfer, missing rights")
                    //   console.log(ex.message)
                    //   assert.include(ex.message, "_to did not respond correctly")
                }

                assert.isTrue(failed);
            });

            it('should call safetransferFrom as assetManager and correct receiver ', async () => {
                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract.options.address,
                    3,
                    '',
                    { privateKey: assetOwnerPK }
                );

                //    if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '3',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '3'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 4);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    1
                );
            });

            it('should return the certificate #3 again', async () => {
                const cert = await certificateLogic.getCertificate(3);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 3);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should be able to transfer token again', async () => {
                const tx = await testreceiver.safeTransferFrom(
                    testreceiver.web3Contract._address,
                    testreceiver.web3Contract._address,
                    3,
                    '',
                    {
                        privateKey: traderPK
                    }
                );

                const cert = await certificateLogic.getCertificate(3);

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: testreceiver.web3Contract._address,
                    1: testreceiver.web3Contract._address,
                    2: '3',
                    _from: testreceiver.web3Contract._address,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '3'
                });
                //    }

                assert.equal(await certificateLogic.getCertificateListLength(), 4);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    1
                );
            });

            it('should return the certificate #3 again', async () => {
                const cert = await certificateLogic.getCertificate(3);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 3);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });
        });

        describe('saveTransferFrom with data', () => {
            it('should log energy again (certificate #4)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    300,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 2, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(2, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '200',
                    2: '300',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '200',
                    _newMeterRead: '300',
                    _timestamp: TIMESTAMP.toString()
                });

                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '4',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '4'
                });
                //    }
                assert.equal(await certificateLogic.getCertificateListLength(), 5);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    1
                );
            });

            it('should return the certificate #4', async () => {
                const cert = await certificateLogic.getCertificate(4);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 4);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safetransferFrom as non owner(admin) and wrong receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        4,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner (trader) and wrong receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        4,
                        '0x01',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as assetManager and wrong receiver ', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        4,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner(admin) and correct receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        4,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safetransferFrom as non owner (trader) and correct receiver', async () => {
                let failed = false;
                try {
                    await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        4,
                        '0x01',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should call safetransferFrom as assetManager and correct receiver ', async () => {
                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    4,
                    '0x01',
                    { privateKey: assetOwnerPK }
                );

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '4',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '4'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 5);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    2
                );
            });

            it('should return the certificate #4 again', async () => {
                const cert = await certificateLogic.getCertificate(4);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 4);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should be able to transfer token again', async () => {
                const tx = await testreceiver.safeTransferFrom(
                    testreceiver.web3Contract._address,
                    testreceiver.web3Contract._address,
                    4,
                    '0x01',
                    {
                        privateKey: traderPK
                    }
                );

                const cert = await certificateLogic.getCertificate(4);
                //   if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: testreceiver.web3Contract._address,
                    1: testreceiver.web3Contract._address,
                    2: '4',
                    _from: testreceiver.web3Contract._address,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '4'
                });
                //   }

                assert.equal(await certificateLogic.getCertificateListLength(), 5);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    2
                );
            });

            it('should return the certificate #4 again', async () => {
                const cert = await certificateLogic.getCertificate(4);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 4);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });
        });

        describe('approval', () => {
            it('should return correct approval', async () => {
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, approvedAccount)
                );
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(accountTrader, approvedAccount)
                );

                const tx = await certificateLogic.setApprovalForAll(approvedAccount, true, {
                    privateKey: assetOwnerPK
                });
                assert.isTrue(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, approvedAccount)
                );
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(accountTrader, approvedAccount)
                );

                const allApprovalEvents = await certificateLogic.getAllApprovalForAllEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovalEvents.length, 1);
                assert.equal(allApprovalEvents[0].event, 'ApprovalForAll');
                assert.deepEqual(allApprovalEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: approvedAccount,
                    2: true,
                    _owner: accountAssetOwner,
                    _operator: approvedAccount,
                    _approved: true
                });
            });

            it('should add 2nd approval', async () => {
                const tx = await certificateLogic.setApprovalForAll(
                    '0x1000000000000000000000000000000000000005',
                    true,
                    { privateKey: assetOwnerPK }
                );
                const allApprovalEvents = await certificateLogic.getAllApprovalForAllEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovalEvents.length, 1);
                assert.equal(allApprovalEvents[0].event, 'ApprovalForAll');
                assert.deepEqual(allApprovalEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: '0x1000000000000000000000000000000000000005',
                    2: true,
                    _owner: accountAssetOwner,
                    _operator: '0x1000000000000000000000000000000000000005',
                    _approved: true
                });

                assert.isTrue(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, approvedAccount)
                );
                assert.isTrue(
                    await certificateLogic.isApprovedForAll(
                        accountAssetOwner,
                        '0x1000000000000000000000000000000000000005'
                    )
                );
            });

            it('should remove approval', async () => {
                const tx = await certificateLogic.setApprovalForAll(
                    '0x1000000000000000000000000000000000000005',
                    false,
                    { privateKey: assetOwnerPK }
                );
                const allApprovalEvents = await certificateLogic.getAllApprovalForAllEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovalEvents.length, 1);
                assert.equal(allApprovalEvents[0].event, 'ApprovalForAll');
                assert.deepEqual(allApprovalEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: '0x1000000000000000000000000000000000000005',
                    2: false,
                    _owner: accountAssetOwner,
                    _operator: '0x1000000000000000000000000000000000000005',
                    _approved: false
                });

                assert.isTrue(
                    await certificateLogic.isApprovedForAll(accountAssetOwner, approvedAccount)
                );
                assert.isFalse(
                    await certificateLogic.isApprovedForAll(
                        accountAssetOwner,
                        '0x1000000000000000000000000000000000000005'
                    )
                );
            });

            it('should return correct getApproved', async () => {
                assert.equal(
                    await certificateLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(1),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(2),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(3),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(4),
                    '0x0000000000000000000000000000000000000000'
                );

                await certificateLogic.approve('0x1000000000000000000000000000000000000005', 2, {
                    privateKey: assetOwnerPK
                });

                assert.equal(
                    await certificateLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(1),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(2),
                    '0x1000000000000000000000000000000000000005'
                );
                assert.equal(
                    await certificateLogic.getApproved(3),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getApproved(4),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when calling getApproved for a non valid token', async () => {
                let failed = false;
                try {
                    await certificateLogic.getApproved(5);
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should log energy again (certificate #5)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    400,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 3, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(3, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '300',
                    2: '400',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '300',
                    _newMeterRead: '400',
                    _timestamp: TIMESTAMP.toString()
                });

                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '5',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '5'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 6);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    2
                );
            });

            it('should return the certificate #5 again', async () => {
                const cert = await certificateLogic.getCertificate(5);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 5);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should transfer certificate #5 as matcher', async () => {
                assert.equal(
                    await certificateLogic.getApproved(5),
                    '0x0000000000000000000000000000000000000000'
                );

                const tx = await certificateLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    5,
                    { privateKey: matcherPK }
                );
                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: accountTrader,
                    2: '5',
                    _from: accountAssetOwner,
                    _to: accountTrader,
                    _tokenId: '5'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 6);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    2
                );
                assert.equal(
                    await certificateLogic.getApproved(5),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #6)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    500,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 4, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(4, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '400',
                    2: '500',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '400',
                    _newMeterRead: '500',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '6',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '6'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 7);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    2
                );
            });

            it('should transferFrom without data certificate #6 as matcher', async () => {
                assert.equal(
                    await certificateLogic.getApproved(6),
                    '0x0000000000000000000000000000000000000000'
                );

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    6,
                    null,
                    { privateKey: matcherPK }
                );
                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '6',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '6'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 7);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    3
                );
                assert.equal(
                    await certificateLogic.getApproved(6),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #7)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    600,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 5, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(5, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '500',
                    2: '600',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '500',
                    _newMeterRead: '600',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '7',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '7'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 8);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    3
                );
            });

            it('should transfer without data certificate #7 as matcher', async () => {
                assert.equal(
                    await certificateLogic.getApproved(7),
                    '0x0000000000000000000000000000000000000000'
                );

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    7,
                    '0x01',
                    { privateKey: matcherPK }
                );
                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '7',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '7'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 8);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    4
                );
                assert.equal(
                    await certificateLogic.getApproved(7),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #8)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    700,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                await certificateLogic.requestCertificates(0, 6, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(6, {
                    privateKey: issuerPK
                });

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '600',
                    2: '700',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '600',
                    _newMeterRead: '700',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '8',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '8'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 9);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    4
                );
            });

            it('should throw trying to transfer old certificate#8 with new matcher but missing role', async () => {
                let failed = false;
                try {
                    await certificateLogic.transferFrom(accountAssetOwner, accountTrader, 8, {
                        privateKey: issuerPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'impleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to safeTransferFrom with data old certificate#8 with new approvedAccount but missing role', async () => {
                let failed = false;
                try {
                    const tx = await certificateLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        8,
                        '0x01',
                        { privateKey: assetSmartmeterPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should set approvedAccount roles', async () => {
                await userLogic.createUser(
                    'propertiesDocumentHash',
                    'documentDBURL',
                    approvedAccount,
                    'approvedAccount',
                    { privateKey: privateKeyDeployment }
                );
                await userLogic.setRoles(approvedAccount, buildRights([Role.Trader]), {
                    privateKey: privateKeyDeployment
                });
            });

            it('should transfer certificate#8 with approved account', async () => {
                assert.equal(
                    await certificateLogic.getApproved(8),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await certificateLogic.getCertificateOwner(8),
                    accountAssetOwner
                );

                const tx = await certificateLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    8,
                    { privateKey: approvedPK }
                );
                //   if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: accountTrader,
                    2: '8',
                    _from: accountAssetOwner,
                    _to: accountTrader,
                    _tokenId: '8'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 9);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    4
                );
                assert.equal(
                    await certificateLogic.getApproved(8),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #9)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    800,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 7, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(7, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '700',
                    2: '800',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '700',
                    _newMeterRead: '800',
                    _timestamp: TIMESTAMP.toString()
                });

                //    if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '9',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '9'
                });
                //    }
                assert.equal(await certificateLogic.getCertificateListLength(), 10);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    4
                );
            });

            it('should safeTransferFrom without data certificate #9 as approved', async () => {
                assert.equal(
                    await certificateLogic.getApproved(9),
                    '0x0000000000000000000000000000000000000000'
                );

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    9,
                    null,
                    { privateKey: approvedPK }
                );
                //   if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '9',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '9'
                });
                //    }
                assert.equal(await certificateLogic.getCertificateListLength(), 10);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    5
                );
                assert.equal(
                    await certificateLogic.getApproved(9),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #10)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    900,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 8, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(8, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '800',
                    2: '900',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '800',
                    _newMeterRead: '900',
                    _timestamp: TIMESTAMP.toString()
                });

                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '10',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '10'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 11);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    5
                );
            });

            it('should safeTransferFrom with data certificate #10 as approved', async () => {
                assert.equal(
                    await certificateLogic.getApproved(10),
                    '0x0000000000000000000000000000000000000000'
                );

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    10,
                    '0x01',
                    { privateKey: approvedPK }
                );
                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '10',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '10'
                });
                //     }
                assert.equal(await certificateLogic.getCertificateListLength(), 11);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    6
                );
                assert.equal(
                    await certificateLogic.getApproved(9),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #11)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1000,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 9, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(9, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '900',
                    2: '1000',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '900',
                    _newMeterRead: '1000',
                    _timestamp: TIMESTAMP.toString()
                });

                //    if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '11',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '11'
                });
                //    }
                assert.equal(await certificateLogic.getCertificateListLength(), 12);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    6
                );
            });

            it('should fail when trying to approve cert#11 as admin', async () => {
                let failed = false;
                try {
                    await certificateLogic.approve(approvedAccount, 11, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'approve: not owner / matcher');
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to approve cert#11 as trader', async () => {
                let failed = false;
                try {
                    await certificateLogic.approve(approvedAccount, 11, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'approve: not owner / matcher');
                }

                assert.isTrue(failed);
            });

            it('should be able to approve as cert-owner', async () => {
                const tx = await certificateLogic.approve(approvedAccount, 11, {
                    privateKey: assetOwnerPK
                });

                //   if (isGanache) {
                const allApprovedEvents = await certificateLogic.getAllApprovalEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovedEvents.length, 1);
                assert.equal(allApprovedEvents[0].event, 'Approval');
                assert.deepEqual(allApprovedEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: approvedAccount,
                    2: '11',
                    _owner: accountAssetOwner,
                    _approved: approvedAccount,
                    _tokenId: '11'
                });
                //    }
            });

            it('should call transferFrom with cert#11 with approved account', async () => {
                assert.equal(await certificateLogic.getApproved(11), approvedAccount);

                const tx = await certificateLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    11,
                    { privateKey: approvedPK }
                );
                //    if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: accountTrader,
                    2: '11',
                    _from: accountAssetOwner,
                    _to: accountTrader,
                    _tokenId: '11'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 12);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    6
                );
                assert.equal(
                    await certificateLogic.getApproved(11),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #12)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1100,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 10, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(10, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1000',
                    2: '1100',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '1000',
                    _newMeterRead: '1100',
                    _timestamp: TIMESTAMP.toString()
                });

                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '12',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '12'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 13);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    6
                );
            });

            it('should be able to approve cert#12 as cert-owner', async () => {
                const tx = await certificateLogic.approve(approvedAccount, 12, {
                    privateKey: assetOwnerPK
                });

                //    if (isGanache) {
                const allApprovedEvents = await certificateLogic.getAllApprovalEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovedEvents.length, 1);
                assert.equal(allApprovedEvents[0].event, 'Approval');
                assert.deepEqual(allApprovedEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: approvedAccount,
                    2: '12',
                    _owner: accountAssetOwner,
                    _approved: approvedAccount,
                    _tokenId: '12'
                });
                //    }
            });

            it('should safeTransferFrom withut data certificate #12 as approved', async () => {
                assert.equal(await certificateLogic.getApproved(12), approvedAccount);

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    12,
                    null,
                    { privateKey: approvedPK }
                );
                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '12',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '12'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 13);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    7
                );
                assert.equal(
                    await certificateLogic.getApproved(9),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #13)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1200,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 11, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(11, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1100',
                    2: '1200',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '1100',
                    _newMeterRead: '1200',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '13',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '13'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 14);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    7
                );
            });

            it('should be able to approve cert#13 as cert-owner', async () => {
                const tx = await certificateLogic.approve(approvedAccount, 13, {
                    privateKey: assetOwnerPK
                });

                //     if (isGanache) {
                const allApprovedEvents = await certificateLogic.getAllApprovalEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allApprovedEvents.length, 1);
                assert.equal(allApprovedEvents[0].event, 'Approval');
                assert.deepEqual(allApprovedEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: approvedAccount,
                    2: '13',
                    _owner: accountAssetOwner,
                    _approved: approvedAccount,
                    _tokenId: '13'
                });
                //  }
            });

            it('should safeTransferFrom withut data certificate #13 as approved', async () => {
                assert.equal(await certificateLogic.getApproved(13), approvedAccount);

                const tx = await certificateLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    13,
                    null,
                    { privateKey: approvedPK }
                );
                //   if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: testreceiver.web3Contract._address,
                    2: '13',
                    _from: accountAssetOwner,
                    _to: testreceiver.web3Contract._address,
                    _tokenId: '13'
                });
                //   }
                assert.equal(await certificateLogic.getCertificateListLength(), 14);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
                assert.equal(
                    await certificateLogic.getApproved(13),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should be able to burn (to = 0x0) a certificate', async () => {
                const tx = await certificateLogic.transferFrom(
                    accountTrader,
                    '0x0000000000000000000000000000000000000000',
                    11,
                    { privateKey: traderPK }
                );
                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountTrader,
                    1: '0x0000000000000000000000000000000000000000',
                    2: '11',
                    _from: accountTrader,
                    _to: '0x0000000000000000000000000000000000000000',
                    _tokenId: '11'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 14);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
                assert.equal(
                    await certificateLogic.getApproved(13),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #14)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1300,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 12, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(12, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1200',
                    2: '1300',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '1200',
                    _newMeterRead: '1300',
                    _timestamp: TIMESTAMP.toString()
                });

                //     if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '14',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '14'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 15);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
            });

            it('should fail when trying to retire cert#14 as admin', async () => {
                let failed = false;

                try {
                    await certificateLogic.retireCertificate(14, { privateKey: accountDeployment });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to retire cert#14 as trader', async () => {
                let failed = false;

                try {
                    await certificateLogic.retireCertificate(14, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should retire cert#14 as owner', async () => {
                assert.isFalse(await certificateLogic.isRetired(14));
                const tx = await certificateLogic.retireCertificate(14, {
                    privateKey: assetOwnerPK
                });
                assert.isTrue(await certificateLogic.isRetired(14));

                const retiredEvents = await certificateLogic.getAllLogCertificateRetiredEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(retiredEvents.length, 1);
                assert.equal(retiredEvents[0].event, 'LogCertificateRetired');
                assert.deepEqual(retiredEvents[0].returnValues, {
                    0: '14',
                    _certificateId: '14'
                });
            });

            it('should be able to call retire cert#14 as owner, but no event', async () => {
                assert.isTrue(await certificateLogic.isRetired(14));
                const tx = await certificateLogic.retireCertificate(14, {
                    privateKey: assetOwnerPK
                });
                assert.isTrue(await certificateLogic.isRetired(14));

                const retiredEvents = await certificateLogic.getAllLogCertificateRetiredEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(retiredEvents.length, 0);
            });

            it('should throw when trying to retire a splitted certificate', async () => {
                assert.isFalse(await certificateLogic.isRetired(0));

                let failed = false;
                try {
                    await certificateLogic.retireCertificate(0, { privateKey: accountAssetOwner });
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });
        });

        describe('ERC20', () => {
            it('should have correct balanes', async () => {
                assert.equal(await erc20Test.balanceOf(accountTrader), 1000000);
                assert.equal(await erc20Test.balanceOf(accountDeployment), 99999999999999000000);
                assert.equal(await erc20Test.balanceOf(accountAssetOwner), 0);
            });

            it('should log energy again (certificate #15)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1400,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 13, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(13, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1300',
                    2: '1400',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '1300',
                    _newMeterRead: '1400',
                    _timestamp: TIMESTAMP.toString()
                });

                // if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '15',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '15'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 16);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 4);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
            });

            it('should not have an acceptedToken after creation', async () => {
                assert.equal(
                    await certificateLogic.getTradableToken(15),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should not have a tokenprice', async () => {
                assert.equal(await certificateLogic.getOnChainDirectPurchasePrice(15), 0);
            });

            it('should fail when trying to set tradableToken as admin', async () => {
                let failed = false;

                try {
                    await certificateLogic.setTradableToken(15, erc20Test.web3Contract._address, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to set tradableToken as trader', async () => {
                let failed = false;

                try {
                    await certificateLogic.setTradableToken(15, erc20Test.web3Contract._address, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should set tradableToken as owner', async () => {
                await certificateLogic.setTradableToken(15, erc20Test.web3Contract._address, {
                    privateKey: assetOwnerPK
                });

                assert.equal(
                    await certificateLogic.getTradableToken(15),
                    erc20Test.web3Contract._address
                );
            });

            it('should fail when trying to buy a certificate that is not for sale', async () => {
                let failed = false;
                try {
                    await certificateLogic.buyCertificate(15, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'Unable to buy a certificate that is not for sale');
                }

                assert.isTrue(failed);
            });

            it('should set certificate for sale', async () => {
                await certificateLogic.publishForSale(15, 0, erc20Test.web3Contract._address, {
                    privateKey: assetOwnerPK
                });
                const cert = await certificateLogic.getCertificate(15);

                assert.isTrue(cert.tradableEntity.forSale);
            });

            it('should fail when trying to buy a token with a price of 0', async () => {
                let failed = false;
                try {
                    await certificateLogic.buyCertificate(15, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'erc20 transfer failed');
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to set the onchainPrice as admin', async () => {
                let failed = false;

                try {
                    await certificateLogic.setOnChainDirectPurchasePrice(15, 1000, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to set the onchainPrice as trader', async () => {
                let failed = false;

                try {
                    await certificateLogic.setOnChainDirectPurchasePrice(15, 1000, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should set the onchainPrice as certOwner', async () => {
                assert.equal(await certificateLogic.getOnChainDirectPurchasePrice(15), 0);

                await certificateLogic.setOnChainDirectPurchasePrice(15, 100, {
                    privateKey: assetOwnerPK
                });
                assert.equal(await certificateLogic.getOnChainDirectPurchasePrice(15), 100);
            });

            it('should return the certificate #15', async () => {
                const cert = await certificateLogic.getCertificate(15);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 15);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(tradableEntity.acceptedToken, erc20Test.web3Contract._address);
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 100);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return the correct tradableEntity (Cert#15)', async () => {
                const tradableEntity = await certificateLogic.getTradableEntity(15);
                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(tradableEntity.acceptedToken, erc20Test.web3Contract._address);
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 100);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should fail when trying to buy a token when the tokens are not approved', async () => {
                let failed = false;
                try {
                    await certificateLogic.buyCertificate(15, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'erc20 transfer failed');
                }

                assert.isTrue(failed);
            });

            it('should fail when trying to buy a token when not enough tokens are not approved', async () => {
                await erc20Test.approve(accountAssetOwner, 99, { privateKey: traderPK });

                let failed = false;
                try {
                    await certificateLogic.buyCertificate(15, { privateKey: traderPK });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'erc20 transfer failed');
                }

                assert.isTrue(failed);
            });

            it('should be able to buy a certficate', async () => {
                await erc20Test.approve(accountAssetOwner, 100, { privateKey: traderPK });

                const tx = await certificateLogic.buyCertificate(15, { privateKey: traderPK });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: accountAssetOwner,
                    1: accountTrader,
                    2: '15',
                    _from: accountAssetOwner,
                    _to: accountTrader,
                    _tokenId: '15'
                });
                //  }
                assert.equal(await certificateLogic.getCertificateListLength(), 16);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 3);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
            });

            it('should return the correct tradableEntity (Cert#15)', async () => {
                const tradableEntity = await certificateLogic.getTradableEntity(15);

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return the certificate #15', async () => {
                const cert = await certificateLogic.getCertificate(15);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 15);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy again (certificate #16)', async () => {
                const TIMESTAMP = moment().unix();
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1500,
                    'lastSmartMeterReadFileHash',
                    TIMESTAMP,
                    { privateKey: assetSmartmeterPK }
                );

                await certificateLogic.requestCertificates(0, 14, {
                    privateKey: assetOwnerPK
                });

                const approveTx = await certificateLogic.approveCertificationRequest(14, {
                    privateKey: issuerPK
                });

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1400',
                    2: '1500',
                    3: TIMESTAMP.toString(),
                    _assetId: '0',
                    _oldMeterRead: '1400',
                    _newMeterRead: '1500',
                    _timestamp: TIMESTAMP.toString()
                });

                //  if (isGanache) {
                const allTransferEvents = await certificateLogic.getAllTransferEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: approveTx.blockNumber
                });

                assert.equal(allTransferEvents.length, 1);

                assert.equal(allTransferEvents.length, 1);
                assert.equal(allTransferEvents[0].event, 'Transfer');
                assert.deepEqual(allTransferEvents[0].returnValues, {
                    0: '0x0000000000000000000000000000000000000000',
                    1: accountAssetOwner,
                    2: '16',
                    _from: '0x0000000000000000000000000000000000000000',
                    _to: accountAssetOwner,
                    _tokenId: '16'
                });
                //    }
                assert.equal(await certificateLogic.getCertificateListLength(), 17);
                assert.equal(await certificateLogic.balanceOf(accountAssetOwner), 4);
                assert.equal(await certificateLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await certificateLogic.balanceOf(testreceiver.web3Contract._address),
                    8
                );
            });

            it('should return the correct tradableEntity (Cert#16)', async () => {
                const tradableEntity = await certificateLogic.getTradableEntity(16);

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return the certificate #16', async () => {
                const cert = await certificateLogic.getCertificate(16);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 16);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

        });
    });
});
