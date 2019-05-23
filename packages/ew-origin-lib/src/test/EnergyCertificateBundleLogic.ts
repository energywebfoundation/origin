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
import { migrateUserRegistryContracts, UserLogic, UserContractLookup, buildRights, Role } from 'ew-user-registry-lib';
import {
    migrateAssetRegistryContracts,
    AssetContractLookup,
    AssetProducingRegistryLogic
} from 'ew-asset-registry-lib';
import { migrateEnergyBundleContracts } from '../utils/migrateContracts';
import { OriginContractLookup } from '../wrappedContracts/OriginContractLookup';
import { CertificateDB } from '../wrappedContracts/CertificateDB';
import { CertificateLogic } from '../wrappedContracts/CertificateLogic';
import { TestReceiver } from '../wrappedContracts/TestReceiver';
import { EnergyCertificateBundleLogic } from '../wrappedContracts/EnergyCertificateBundleLogic';
import { EnergyCertificateBundleDB } from '../wrappedContracts/EnergyCertificateBundleDB';
import { Erc20TestToken } from '../wrappedContracts/Erc20TestToken';
import Web3 from 'web3';
import Erc20TestTokenJSON from '../../build/contracts/Erc20TestToken.json';
import Erc721TestReceiverJSON from '../../build/contracts/TestReceiver.json';
import { deploy } from 'ew-utils-deployment';
import {
    EnergyCertificateBundleLogicJSON,
    EnergyCertificateBundleDBJSON,
    OriginContractLookupJSON
} from '..';
import * as Certificate from '../blockchain-facade/Certificate';

describe('EnergyCertificateBundleLogic', () => {
    let assetRegistryContract: AssetContractLookup;
    let originRegistryContract: OriginContractLookup;
    let energyCertificateBundleLogic: EnergyCertificateBundleLogic;
    let energyCertificateBundleDB: EnergyCertificateBundleDB;
    let isGanache: boolean;
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

    const assetOwnerPK = '0xc118b0425221384fe0cbbd093b2a81b1b65d0330810e0792c7059e518cea5383';
    const accountAssetOwner = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const traderPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const matcherPK = '0xd9d5e7a2ebebbad1eb22a63baa739a6c6a6f15d07fcc990ea4dea5c64022a87a';
    const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK).address;

    const approvedPK = '0x7da67da863672d4cc2984e93ce28d98b0d782d8caa43cd1c977b919c0209541b';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    describe('init checks', () => {
        it('should deploy the contracts', async () => {
            // isGanache = (await getClientVersion(web3)).includes('EthereumJS');

            const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);

            userLogic = new UserLogic(web3 as any, (userContracts as any).UserLogic);

            await userLogic.setUser(accountDeployment, 'admin', {
                privateKey: privateKeyDeployment
            });

            await userLogic.setRoles(accountDeployment, buildRights([
                Role.UserAdmin,
                Role.AssetAdmin
            ]), { privateKey: privateKeyDeployment });

            const userContractLookupAddr = (userContracts as any).UserContractLookup;

            userRegistryContract = new UserContractLookup(web3 as any, userContractLookupAddr);
            const assetContracts = await migrateAssetRegistryContracts(
                web3,
                userContractLookupAddr,
                privateKeyDeployment
            );

            const assetRegistryLookupAddr = (assetContracts as any).AssetContractLookup;

            const assetProducingAddr = (assetContracts as any).AssetProducingRegistryLogic;
            const originContracts = await migrateEnergyBundleContracts(
                web3,
                assetRegistryLookupAddr,
                privateKeyDeployment
            );

            assetRegistryContract = new AssetContractLookup(web3, assetRegistryLookupAddr);
            assetRegistry = new AssetProducingRegistryLogic(web3 as any, assetProducingAddr);

            for (let key of Object.keys(originContracts)) {
                let tempBytecode;

                if (key.includes('OriginContractLookup')) {
                    originRegistryContract = new OriginContractLookup(web3, originContracts[key]);
                    tempBytecode = OriginContractLookupJSON.deployedBytecode;
                }

                if (key.includes('EnergyCertificateBundleLogic')) {
                    energyCertificateBundleLogic = new EnergyCertificateBundleLogic(
                        web3,
                        originContracts[key]
                    );
                    tempBytecode = EnergyCertificateBundleLogicJSON.deployedBytecode;
                }

                if (key.includes('EnergyCertificateBundleDB')) {
                    energyCertificateBundleDB = new EnergyCertificateBundleDB(
                        web3,
                        originContracts[key]
                    );
                    tempBytecode = EnergyCertificateBundleDBJSON.deployedBytecode;
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
                        .encodeParameter(
                            'address',
                            energyCertificateBundleLogic.web3Contract.options.address
                        )
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
                await energyCertificateBundleLogic.owner(),
                originRegistryContract.web3Contract._address
            );
        });

        it('should have the lookup-contracts', async () => {
            // tslint:disable-next-line:max-line-length
            assert.equal(
                await energyCertificateBundleLogic.assetContractLookup(),
                assetRegistryContract.web3Contract._address
            );
            assert.equal(
                await energyCertificateBundleLogic.userContractLookup(),
                userRegistryContract.web3Contract._address
            );
        });

        it('should the correct DB', async () => {
            assert.equal(
                await energyCertificateBundleLogic.db(),
                energyCertificateBundleDB.web3Contract._address
            );
        });

        it('should have balances of 0', async () => {
            assert.equal(await energyCertificateBundleLogic.balanceOf(accountDeployment), 0);
            assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 0);
            assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 0);
        });

        it('should throw for balance of address 0x0', async () => {
            let failed = false;
            try {
                await energyCertificateBundleLogic.balanceOf(
                    '0x0000000000000000000000000000000000000000'
                );
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to access a non existing certificate', async () => {
            let failed = false;
            try {
                await energyCertificateBundleLogic.ownerOf(0);
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call safeTransferFrom a non existing certificate', async () => {
            let failed = false;
            try {
                await energyCertificateBundleLogic.safeTransferFrom(
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
                await energyCertificateBundleLogic.safeTransferFrom(
                    accountDeployment,
                    accountTrader,
                    0,
                    { privateKey: privateKeyDeployment }
                );
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call transferFrom a non existing certificate', async () => {
            let failed = false;
            try {
                await energyCertificateBundleLogic.transferFrom(
                    accountDeployment,
                    accountTrader,
                    0,
                    { privateKey: privateKeyDeployment }
                );
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should throw when trying to call approve a non existing certificate', async () => {
            let failed = false;
            try {
                await energyCertificateBundleLogic.approve(accountTrader, 0, {
                    privateKey: privateKeyDeployment
                });
            } catch (ex) {
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('should set right roles to users', async () => {
            await userLogic.setUser(accountTrader, 'trader', { privateKey: privateKeyDeployment });
            await userLogic.setUser(accountAssetOwner, 'assetOwner', {
                privateKey: privateKeyDeployment
            });

            await userLogic.setRoles(accountTrader, buildRights([
                Role.Trader
            ]), { privateKey: privateKeyDeployment });
            await userLogic.setRoles(accountAssetOwner, buildRights([
                Role.AssetManager,
                Role.Trader
            ]), { privateKey: privateKeyDeployment });
        });

        it('should onboard an asset', async () => {
            await assetRegistry.createAsset(
                assetSmartmeter,
                accountAssetOwner,
                true,
                ['0x1000000000000000000000000000000000000005'] as any,
                'propertiesDocumentHash',
                'url',
                2,
                {
                    privateKey: privateKeyDeployment
                }
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

        it('should enable bundle', async () => {
            await assetRegistry.setBundleActive(0, true, { privateKey: assetOwnerPK });
        });

        it('should return right interface', async () => {
            assert.isTrue(await energyCertificateBundleLogic.supportsInterface('0x80ac58cd'));
            assert.isFalse(await energyCertificateBundleLogic.supportsInterface('0x80ac58c1'));
        });

        describe('transferFrom', () => {
            it('should have 0 certificates', async () => {
                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 0);
            });

            it('should log energy', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    100,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '0',
                    2: '100',
                    _assetId: '0',
                    _oldMeterRead: '0',
                    _newMeterRead: '100'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: '0x0000000000000000000000000000000000000000',
                        1: accountAssetOwner,
                        2: '0',
                        _from: '0x0000000000000000000000000000000000000000',
                        _to: accountAssetOwner,
                        _tokenId: '0'
                    });
                }
            });

            it('should have 1 certificate', async () => {
                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 1);
            });

            it('should return the bundle', async () => {
                const bundle = await energyCertificateBundleLogic.getBundle(0);

                const bundleSpecific = bundle.certificateSpecific;

                assert.equal(bundleSpecific.status, Certificate.Status.Active);
                assert.equal(bundleSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(bundleSpecific.parentId, 0);
                assert.equal(bundleSpecific.children.length, 0);
                assert.equal(bundleSpecific.maxOwnerChanges, 2);
                assert.equal(bundleSpecific.ownerChangeCounter, 0);

                const tradableEntity = bundle.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005'
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should have a balance of 1 for assetOwner address', async () => {
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountDeployment), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(matcherAccount), 0);
            });

            it('should return the correct owner', async () => {
                assert.equal(await energyCertificateBundleLogic.ownerOf(0), accountAssetOwner);
            });

            it('should return correct approvedFor', async () => {
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return correct isApprovedForAll', async () => {
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        accountDeployment
                    )
                );
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        accountTrader
                    )
                );
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        matcherAccount
                    )
                );
            });

            it('should throw when trying to call transferFrom as an admin that does not own that', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountAssetOwner,
                        accountTrader,
                        0,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom as an trader that does not own that', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountAssetOwner,
                        accountTrader,
                        0,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom using wrong _from', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountDeployment,
                        accountTrader,
                        1,
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should be able to do transferFrom', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    0,
                    { privateKey: assetOwnerPK }
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountDeployment), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(matcherAccount), 0);
                if (isGanache) {
                    const allEvents = await energyCertificateBundleLogic.getAllTransferEvents({
                        fromBlock: tx.blockNumber,
                        toBlock: tx.blockNumber
                    });

                    assert.equal(allEvents.length, 1);
                    assert.equal(allEvents[0].event, 'Transfer');
                    assert.deepEqual(allEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: accountTrader,
                        2: '0',
                        _from: accountAssetOwner,
                        _to: accountTrader,
                        _tokenId: '0'
                    });
                }
            });

            it('should return the bundle again ', async () => {
                const bundle = await energyCertificateBundleLogic.getBundle(0);

                const bundleSpecific = bundle.certificateSpecific;

                assert.equal(bundleSpecific.status, Certificate.Status.Active);
                assert.equal(bundleSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(bundleSpecific.parentId, 0);
                assert.equal(bundleSpecific.children.length, 0);
                assert.equal(bundleSpecific.maxOwnerChanges, 2);
                assert.equal(bundleSpecific.ownerChangeCounter, 1);

                const tradableEntity = bundle.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call transferFrom as an admin that does not own that', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        0,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom as an assetOwner that does not own that', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        0,
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom using wrong _from', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountDeployment,
                        accountTrader,
                        1,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should be able to do transferFrom again', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountTrader,
                    accountTrader,
                    0,
                    { privateKey: traderPK }
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountDeployment), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(matcherAccount), 0);
                if (isGanache) {
                    const allEvents = await energyCertificateBundleLogic.getAllTransferEvents({
                        fromBlock: tx.blockNumber,
                        toBlock: tx.blockNumber
                    });

                    assert.equal(allEvents.length, 1);
                    assert.equal(allEvents[0].event, 'Transfer');
                    assert.deepEqual(allEvents[0].returnValues, {
                        0: accountTrader,
                        1: accountTrader,
                        2: '0',
                        _from: accountTrader,
                        _to: accountTrader,
                        _tokenId: '0'
                    });

                    const retireEvent = await energyCertificateBundleLogic.getAllLogBundleRetiredEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(retireEvent.length, 1);
                    assert.equal(retireEvent[0].event, 'LogBundleRetired');
                    assert.deepEqual(retireEvent[0].returnValues, {
                        0: '0',
                        1: true,
                        _bundleId: '0',
                        _retire: true
                    });
                }
            });

            it('should return the bundle again ', async () => {
                const bundle = await energyCertificateBundleLogic.getBundle(0);

                const bundleSpecific = bundle.certificateSpecific;

                assert.equal(bundleSpecific.status, Certificate.Status.Retired);
                assert.equal(bundleSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(bundleSpecific.parentId, 0);
                assert.equal(bundleSpecific.children.length, 0);
                assert.equal(bundleSpecific.maxOwnerChanges, 2);
                assert.equal(bundleSpecific.ownerChangeCounter, 2);

                const tradableEntity = bundle.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call transferFrom on a retired certificate as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        1,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom on a retired certificate as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        1,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call transferFrom on a retired certificate as assetOwner', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        1,
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });
        });
        describe('saveTransferFrom without data', () => {
            it('should log energy (Bundle #1)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    200,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '100',
                    2: '200',
                    _assetId: '0',
                    _oldMeterRead: '100',
                    _newMeterRead: '200'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: '0x0000000000000000000000000000000000000000',
                        1: accountAssetOwner,
                        2: '1',
                        _from: '0x0000000000000000000000000000000000000000',
                        _to: accountAssetOwner,
                        _tokenId: '1'
                    });
                }
            });

            it('should return the bundle #1', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(1);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 1);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005'
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safeTransferFrom to a regular address as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        1,
                        null,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a regular address as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        1,
                        null,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a regular address as owner', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        1,
                        null,
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, '_to is not a contract');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        1,
                        null,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        1,
                        null,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        1,
                        null,
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a correct receiver as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        1,
                        null,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        1,
                        null,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should call safetransferFrom as assetManager and correct receiver ', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    1,
                    null,
                    { privateKey: assetOwnerPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '1',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '1'
                    });
                }
                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    1
                );
            });
        });

        describe('saveTransferFrom with data', () => {
            it('should log energy (Bundle #2)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    300,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '200',
                    2: '300',
                    _assetId: '0',
                    _oldMeterRead: '200',
                    _newMeterRead: '300'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: '0x0000000000000000000000000000000000000000',
                        1: accountAssetOwner,
                        2: '2',
                        _from: '0x0000000000000000000000000000000000000000',
                        _to: accountAssetOwner,
                        _tokenId: '2'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 3);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    1
                );
            });

            it('should return the bundle #2', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(2);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 2);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005'
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safeTransferFrom to a regular address as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        2,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a regular address as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        2,
                        '0x01',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a regular address as owner', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        2,
                        '0x01',
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, '_to is not a contract');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        2,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        2,
                        '0x01',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        2,
                        '0x01',
                        { privateKey: assetOwnerPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a correct receiver as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        2,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom to a contract without specific funcion as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        2,
                        '0x01',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }

                assert.isTrue(failed);
            });

            it('should call safetransferFrom as assetManager and correct receiver ', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    2,
                    '0x01',
                    { privateKey: assetOwnerPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '2',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '2'
                    });
                }
                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 3);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 0);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    2
                );
            });
        });

        describe('escrow and approval', () => {
            /*
            it('should set an escrow to the asset', async () => {
                await assetRegistry.addMatcher(0, matcherAccount, { privateKey: assetOwnerPK });
                assert.deepEqual(await assetRegistry.getMatcher(0),
                                 ['0x1000000000000000000000000000000000000005', matcherAccount]);
            });
            */

            it('should return correct approval', async () => {
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        approvedAccount
                    )
                );
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountTrader,
                        approvedAccount
                    )
                );

                const tx = await energyCertificateBundleLogic.setApprovalForAll(
                    approvedAccount,
                    true,
                    { privateKey: assetOwnerPK }
                );
                assert.isTrue(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        approvedAccount
                    )
                );
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountTrader,
                        approvedAccount
                    )
                );

                const allApprovalEvents = await energyCertificateBundleLogic.getAllApprovalForAllEvents(
                    { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                );

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
                const tx = await energyCertificateBundleLogic.setApprovalForAll(
                    '0x1000000000000000000000000000000000000005',
                    true,
                    { privateKey: assetOwnerPK }
                );
                const allApprovalEvents = await energyCertificateBundleLogic.getAllApprovalForAllEvents(
                    { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                );

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
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        approvedAccount
                    )
                );
                assert.isTrue(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        '0x1000000000000000000000000000000000000005'
                    )
                );
            });

            it('should remove approval', async () => {
                const tx = await energyCertificateBundleLogic.setApprovalForAll(
                    '0x1000000000000000000000000000000000000005',
                    false,
                    { privateKey: assetOwnerPK }
                );
                const allApprovalEvents = await energyCertificateBundleLogic.getAllApprovalForAllEvents(
                    { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                );

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
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        approvedAccount
                    )
                );
                assert.isFalse(
                    await energyCertificateBundleLogic.isApprovedForAll(
                        accountAssetOwner,
                        '0x1000000000000000000000000000000000000005'
                    )
                );
            });

            it('should log energy (Bundle #3)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    400,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '300',
                    2: '400',

                    _assetId: '0',
                    _oldMeterRead: '300',
                    _newMeterRead: '400'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 4);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    2
                );
            });

            it('should return the bundle #3', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(3);

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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005'
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should return correct getApproved', async () => {
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(1),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(2),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(3),
                    '0x0000000000000000000000000000000000000000'
                );

                await energyCertificateBundleLogic.approve(
                    '0x1000000000000000000000000000000000000005',
                    3,
                    { privateKey: assetOwnerPK }
                );

                assert.equal(
                    await energyCertificateBundleLogic.getApproved(0),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(1),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(2),
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(
                    await energyCertificateBundleLogic.getApproved(3),
                    '0x1000000000000000000000000000000000000005'
                );
            });

            it('should throw when calling getApproved for a non valid token', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.getApproved(4);
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should throw when calling approve as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.approve(
                        '0x1000000000000000000000000000000000000005',
                        3,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'approve: not owner / matcher');
                }
                assert.isTrue(failed);
            });

            it('should throw when calling approve as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.approve(
                        '0x1000000000000000000000000000000000000005',
                        3,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'approve: not owner / matcher');
                }
                assert.isTrue(failed);
            });

            it('should set an escrow to the asset', async () => {
                await assetRegistry.addMatcher(0, matcherAccount, { privateKey: assetOwnerPK });
                assert.deepEqual(await assetRegistry.getMatcher(0), [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
            });

            it('should throw trying to transfer old certificate with new matcher', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should log energy (Bundle #4)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    500,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '400',
                    2: '500',
                    _assetId: '0',
                    _oldMeterRead: '400',
                    _newMeterRead: '500'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 5);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 1);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    2
                );
            });

            it('should return the bundle #4', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(4);

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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should transfer certificate#4 with new matcher', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    4,
                    { privateKey: matcherPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: accountTrader,
                        2: '4',
                        _from: accountAssetOwner,
                        _to: accountTrader,
                        _tokenId: '4'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 5);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    2
                );
            });

            it('should log energy (Bundle #5)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    600,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '500',
                    2: '600',
                    _assetId: '0',
                    _oldMeterRead: '500',
                    _newMeterRead: '600'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 6);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    2
                );
            });

            it('should return the bundle #5', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(5);

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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an address', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        3,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an receiver contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        3,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an address', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        5,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        5,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should reset matcherAccount roles to 0', async () => {
                await userLogic.setUser(matcherAccount, 'matcherAccount', {
                    privateKey: privateKeyDeployment
                });
                await userLogic.setRoles(matcherAccount, buildRights([]), { privateKey: privateKeyDeployment });
            });

            it('should throw trying to call safeTransferFrom certificate#3 without data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        5,
                        null,
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should reset matcherAccount roles to trader', async () => {
                await userLogic.setUser(matcherAccount, 'matcherAccount', {
                    privateKey: privateKeyDeployment
                });
                await userLogic.setRoles(matcherAccount, buildRights([
                    Role.Trader
                ]), { privateKey: privateKeyDeployment });
            });

            it('should transfer certificate#5 with new matcher', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    5,
                    null,
                    { privateKey: matcherPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '5',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '5'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 6);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    3
                );
            });

            it('should return the bundle #5', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(5);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 5);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #6)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    700,
                    'lastSmartMeterReadFileHash',

                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '600',
                    2: '700',
                    _assetId: '0',
                    _oldMeterRead: '600',
                    _newMeterRead: '700'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 7);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    3
                );
            });

            it('should return the bundle #6', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(6);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 6);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw trying to call safeTransferFrom certificate#3 with data and new matcher to an address', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        3,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 with data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        3,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 with data and new matcher to an receiver contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        3,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#3 with data and new matcher to an address', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        5,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the owner of the entity');
                }
                assert.isTrue(failed);
            });

            it('should throw trying to call safeTransferFrom certificate#5 with data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        6,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should reset matcherAccount roles to 0', async () => {
                await userLogic.setUser(matcherAccount, 'matcherAccount', {
                    privateKey: privateKeyDeployment
                });
                await userLogic.setRoles(matcherAccount, buildRights([]), { privateKey: privateKeyDeployment });
            });

            it('should throw trying to call safeTransferFrom certificate#3 with data and new matcher to an a regular contract', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        6,
                        '0x01',
                        { privateKey: matcherPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'user does not have the required role');
                }
                assert.isTrue(failed);
            });

            it('should reset matcherAccount roles to trader', async () => {
                await userLogic.setUser(matcherAccount, 'matcherAccount', {
                    privateKey: privateKeyDeployment
                });
                await userLogic.setRoles(matcherAccount, buildRights([
                    Role.Trader
                ]), { privateKey: privateKeyDeployment });
            });

            it('should transfer certificate#6 with new matcher', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    6,
                    '0x01',
                    { privateKey: matcherPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 7);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    4
                );
            });

            it('should return the bundle #5', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(6);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 6);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #7)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    800,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '700',
                    2: '800',
                    _assetId: '0',
                    _oldMeterRead: '700',
                    _newMeterRead: '800'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 8);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 2);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    4
                );
            });

            it('should return the bundle #7', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(7);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 7);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call transferFrom as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountAssetOwner,
                        accountTrader,
                        7,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should transferFrom as approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, true, {
                    privateKey: assetOwnerPK
                });

                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    7,
                    { privateKey: approvedPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: accountTrader,
                        2: '7',
                        _from: accountAssetOwner,
                        _to: accountTrader,
                        _tokenId: '7'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 8);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    4
                );
            });

            it('should return the bundle #7 again', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(7);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 7);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should set role to approved account', async () => {
                await userLogic.setUser(approvedAccount, 'approvedAccount', {
                    privateKey: privateKeyDeployment
                });
                await userLogic.setRoles(approvedAccount, buildRights([
                    Role.Trader
                ]), { privateKey: privateKeyDeployment });
            });

            it('should log energy (Bundle #8)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    900,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '800',
                    2: '900',
                    _assetId: '0',
                    _oldMeterRead: '800',
                    _newMeterRead: '900'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 9);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    4
                );
            });

            it('should return the bundle #8', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(8);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 8);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safeTransferFrom with no data to regular address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        8,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to random contract address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        8,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to correct contract address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        8,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to regular address as approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, true, {
                    privateKey: assetOwnerPK
                });

                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        8,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, '_to is not a contract');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to random contract address as approved account', async () => {
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        8,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should call safeTransferFrom with no data to correct contract address as approved account', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    8,
                    null,
                    { privateKey: approvedPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '8',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '8'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 9);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    5
                );
            });

            it('should return the bundle #8 again', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(8);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 8);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #9)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1000,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '900',
                    2: '1000',
                    _assetId: '0',
                    _oldMeterRead: '900',
                    _newMeterRead: '1000'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 10);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    5
                );
            });

            it('should return the bundle #9', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(9);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 9);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call safeTransferFrom with no data to regular address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        9,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'simpleTransfer, missing rights');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to random contract address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        9,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to correct contract address as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        testreceiver.web3Contract._address,
                        9,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to regular address as approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, true, {
                    privateKey: assetOwnerPK
                });

                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        9,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to random contract address as approved account', async () => {
                let failed = false;
                try {
                    const tx = await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        9,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should call safeTransferFrom with no data to correct contract address as approved account', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    9,
                    '0x01',
                    { privateKey: approvedPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 10);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    6
                );
            });

            it('should return the bundle #9 again', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(9);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 9);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #10)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1100,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1000',
                    2: '1100',
                    _assetId: '0',
                    _oldMeterRead: '1000',
                    _newMeterRead: '1100'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 11);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 3);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    6
                );
            });

            it('should return the bundle #10', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(10);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 10);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should approve bundle #10', async () => {
                await energyCertificateBundleLogic.approve(approvedAccount, 10, {
                    privateKey: assetOwnerPK
                });

                const cert = await energyCertificateBundleLogic.getBundle(10);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 10);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(tradableEntity.approvedAddress, approvedAccount);
            });

            it('should throw when trying to call transferFrom as non approved account', async () => {
                await energyCertificateBundleLogic.setApprovalForAll(approvedAccount, false, {
                    privateKey: assetOwnerPK
                });
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountAssetOwner,
                        accountTrader,
                        10,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should transferFrom as approved account', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    10,
                    { privateKey: approvedPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: accountTrader,
                        2: '10',
                        _from: accountAssetOwner,
                        _to: accountTrader,
                        _tokenId: '10'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 11);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    6
                );
            });

            it('should approve bundle #10', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(10);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 10);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #11)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1200,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1100',
                    2: '1200',
                    _assetId: '0',
                    _oldMeterRead: '1100',
                    _newMeterRead: '1200'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 12);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    6
                );
            });

            it('should return the bundle #11', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(11);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 11);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should approve bundle #11', async () => {
                await energyCertificateBundleLogic.approve(approvedAccount, 11, {
                    privateKey: assetOwnerPK
                });

                const cert = await energyCertificateBundleLogic.getBundle(11);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 11);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(tradableEntity.approvedAddress, approvedAccount);
            });

            it('should throw when trying to call safeTransferFrom with no data to an address as approved account', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        11,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, '_to is not a contract');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with no data to a random contract address as approved account', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        11,
                        null,
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should call safeTransferFrom with no data to random contract address as approved account', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    11,
                    null,
                    { privateKey: approvedPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '11',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '11'
                    });
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 12);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    7
                );
            });

            it('should return bundle #11', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(11);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 11);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #12)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1300,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1200',
                    2: '1300',
                    _assetId: '0',
                    _oldMeterRead: '1200',
                    _newMeterRead: '1300'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 13);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    7
                );
            });

            it('should return the bundle #12', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(12);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 12);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should approve bundle #12', async () => {
                await energyCertificateBundleLogic.approve(approvedAccount, 12, {
                    privateKey: assetOwnerPK
                });

                const cert = await energyCertificateBundleLogic.getBundle(12);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 12);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(tradableEntity.approvedAddress, approvedAccount);
            });

            it('should throw when trying to call safeTransferFrom with data to an address as approved account', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        accountTrader,
                        12,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, '_to is not a contract');
                }
                assert.isTrue(failed);
            });

            it('should throw when trying to call safeTransferFrom with data to a random contract address as approved account', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.safeTransferFrom(
                        accountAssetOwner,
                        energyCertificateBundleLogic.web3Contract._address,
                        12,
                        '0x01',
                        { privateKey: approvedPK }
                    );
                } catch (ex) {
                    failed = true;
                }
                assert.isTrue(failed);
            });

            it('should call safeTransferFrom with data to random contract address as approved account', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    12,
                    '0x01',
                    { privateKey: approvedPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 13);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    8
                );
            });

            it('should get bundle #12 again', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(12);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 12);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should log energy (Bundle #13)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1400,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1300',
                    2: '1400',
                    _assetId: '0',
                    _oldMeterRead: '1300',
                    _newMeterRead: '1400'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 14);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 4);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    8
                );
            });

            it('should return the bundle #13', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(13);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 13);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call setTradableToken as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.setTradableToken(
                        13,
                        '0x1000000000000000000000000000000000000006',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call setTradableToken as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.setTradableToken(
                        13,
                        '0x1000000000000000000000000000000000000006',
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should call setTradableToken as owner', async () => {
                await energyCertificateBundleLogic.setTradableToken(
                    13,
                    '0x1000000000000000000000000000000000000006',
                    { privateKey: assetOwnerPK }
                );

                const cert = await energyCertificateBundleLogic.getBundle(13);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 13);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x1000000000000000000000000000000000000006'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should throw when trying to call setOnChainDirectPurchasePrice as admin', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.setOnChainDirectPurchasePrice(13, 1000, {
                        privateKey: privateKeyDeployment
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should throw when trying to call setOnChainDirectPurchasePrice as trader', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.setOnChainDirectPurchasePrice(13, 1000, {
                        privateKey: traderPK
                    });
                } catch (ex) {
                    failed = true;
                    assert.include(ex.message, 'not the entity-owner');
                }

                assert.isTrue(failed);
            });

            it('should call setOnChainDirectPurchasePrice as owner', async () => {
                await energyCertificateBundleLogic.setOnChainDirectPurchasePrice(13, 1000, {
                    privateKey: assetOwnerPK
                });

                const cert = await energyCertificateBundleLogic.getBundle(13);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 13);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x1000000000000000000000000000000000000006'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 1000);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should reset onChainPrice and token when transfering(transferFrom) a bundle', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountAssetOwner,
                    accountTrader,
                    13,
                    { privateKey: assetOwnerPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: accountTrader,
                        2: '13',
                        _from: accountAssetOwner,
                        _to: accountTrader,
                        _tokenId: '13'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(13);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 13);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 14);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    8
                );
            });

            it('should be able to transfer bundle again + auto retire', async () => {
                const tx = await energyCertificateBundleLogic.transferFrom(
                    accountTrader,
                    accountTrader,
                    13,
                    { privateKey: traderPK }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountTrader,
                        1: accountTrader,
                        2: '13',
                        _from: accountTrader,
                        _to: accountTrader,
                        _tokenId: '13'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(13);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Retired);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 13);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 2);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountTrader);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 14);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    8
                );
            });
            it('should when trying to call transferFrom on retired bundle', async () => {
                let failed = false;
                try {
                    await energyCertificateBundleLogic.transferFrom(
                        accountTrader,
                        accountTrader,
                        13,
                        { privateKey: traderPK }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should log energy (Bundle #14)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1500,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');
                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1400',
                    2: '1500',
                    _assetId: '0',
                    _oldMeterRead: '1400',
                    _newMeterRead: '1500'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 15);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    8
                );
            });

            it('should return the bundle #14', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(14);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 14);
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
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should set acceptedToken and onChainDirectPurchasePrice', async () => {
                await energyCertificateBundleLogic.setTradableToken(
                    14,
                    '0x1000000000000000000000000000000000000006',
                    { privateKey: assetOwnerPK }
                );

                await energyCertificateBundleLogic.setOnChainDirectPurchasePrice(14, 1000, {
                    privateKey: assetOwnerPK
                });
                const cert = await energyCertificateBundleLogic.getBundle(14);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 14);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 0);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, accountAssetOwner);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x1000000000000000000000000000000000000006'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 1000);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should reset onChainPrice and token when transfering(safeTransferFrom without data) a bundle', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    14,
                    null,
                    { privateKey: assetOwnerPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '14',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '14'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(14);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 14);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 15);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    9
                );
            });

            it('should be able to transfer bundle again + auto retire #2', async () => {
                await userLogic.setUser(testreceiver.web3Contract._address, 'TestReceiver', {
                    privateKey: privateKeyDeployment
                });

                await userLogic.setRoles(testreceiver.web3Contract._address, buildRights([
                    Role.Trader
                ]), {
                    privateKey: privateKeyDeployment
                });
                const tx = await testreceiver.safeTransferFrom(
                    testreceiver.web3Contract._address,
                    testreceiver.web3Contract._address,
                    14,
                    null,
                    { privateKey: privateKeyDeployment }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: testreceiver.web3Contract._address,
                        1: testreceiver.web3Contract._address,
                        2: '14',
                        _from: testreceiver.web3Contract._address,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '14'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(14);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Retired);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 14);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 2);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 15);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    9
                );
            });

            it('should when trying to call safeTransferFrom on retired bundle', async () => {
                let failed = false;
                try {
                    await testreceiver.safeTransferFrom(
                        testreceiver.web3Contract._address,
                        testreceiver.web3Contract._address,
                        14,
                        null,
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });

            it('should log energy (Bundle #15)', async () => {
                const tx = await assetRegistry.saveSmartMeterRead(
                    0,
                    1600,
                    'lastSmartMeterReadFileHash',
                    { privateKey: assetSmartmeterPK }
                );

                const event = (await assetRegistry.getAllLogNewMeterReadEvents({
                    fromBlock: tx.blockNumber,
                    toBlock: tx.blockNumber
                }))[0];

                assert.equal(event.event, 'LogNewMeterRead');

                assert.deepEqual(event.returnValues, {
                    0: '0',
                    1: '1500',
                    2: '1600',
                    _assetId: '0',
                    _oldMeterRead: '1500',
                    _newMeterRead: '1600'
                });

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

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
                }

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 16);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 2);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    9
                );
            });

            it('should return the bundle #15', async () => {
                const cert = await energyCertificateBundleLogic.getBundle(15);

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
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should set acceptedToken and onChainDirectPurchasePrice', async () => {
                await energyCertificateBundleLogic.setTradableToken(
                    15,
                    '0x1000000000000000000000000000000000000006',
                    { privateKey: assetOwnerPK }
                );

                await energyCertificateBundleLogic.setOnChainDirectPurchasePrice(15, 1000, {
                    privateKey: assetOwnerPK
                });
                const cert = await energyCertificateBundleLogic.getBundle(15);

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
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x1000000000000000000000000000000000000006'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 1000);
                assert.deepEqual(tradableEntity.escrow, [
                    '0x1000000000000000000000000000000000000005',
                    matcherAccount
                ]);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );
            });

            it('should reset onChainPrice and token when transfering(safeTransferFrom with data) a bundle', async () => {
                const tx = await energyCertificateBundleLogic.safeTransferFrom(
                    accountAssetOwner,
                    testreceiver.web3Contract._address,
                    15,
                    '0x01',
                    { privateKey: assetOwnerPK }
                );

                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: accountAssetOwner,
                        1: testreceiver.web3Contract._address,
                        2: '15',
                        _from: accountAssetOwner,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '15'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(15);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Active);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 15);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 1);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 16);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    10
                );
            });

            it('should be able to transfer bundle again + auto retire #3', async () => {
                const tx = await testreceiver.safeTransferFrom(
                    testreceiver.web3Contract._address,
                    testreceiver.web3Contract._address,
                    15,
                    '0x01',
                    { privateKey: privateKeyDeployment }
                );
                if (isGanache) {
                    const allTransferEvents = await energyCertificateBundleLogic.getAllTransferEvents(
                        { fromBlock: tx.blockNumber, toBlock: tx.blockNumber }
                    );

                    assert.equal(allTransferEvents.length, 1);

                    assert.equal(allTransferEvents.length, 1);
                    assert.equal(allTransferEvents[0].event, 'Transfer');
                    assert.deepEqual(allTransferEvents[0].returnValues, {
                        0: testreceiver.web3Contract._address,
                        1: testreceiver.web3Contract._address,
                        2: '15',
                        _from: testreceiver.web3Contract._address,
                        _to: testreceiver.web3Contract._address,
                        _tokenId: '15'
                    });
                }

                const cert = await energyCertificateBundleLogic.getBundle(15);

                const certificateSpecific = cert.certificateSpecific;

                assert.equal(certificateSpecific.status, Certificate.Status.Retired);
                assert.equal(certificateSpecific.dataLog, 'lastSmartMeterReadFileHash');
                assert.equal(certificateSpecific.parentId, 15);
                assert.equal(certificateSpecific.children.length, 0);
                assert.equal(certificateSpecific.maxOwnerChanges, 2);
                assert.equal(certificateSpecific.ownerChangeCounter, 2);

                const tradableEntity = cert.tradableEntity;

                assert.equal(tradableEntity.assetId, 0);
                assert.equal(tradableEntity.owner, testreceiver.web3Contract._address);
                assert.equal(tradableEntity.powerInW, 100);
                assert.equal(
                    tradableEntity.acceptedToken,
                    '0x0000000000000000000000000000000000000000'
                );
                assert.equal(tradableEntity.onChainDirectPurchasePrice, 0);
                assert.deepEqual(tradableEntity.escrow, []);
                assert.equal(
                    tradableEntity.approvedAddress,
                    '0x0000000000000000000000000000000000000000'
                );

                assert.equal(await energyCertificateBundleLogic.getBundleListLength(), 16);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountAssetOwner), 1);
                assert.equal(await energyCertificateBundleLogic.balanceOf(accountTrader), 5);
                assert.equal(
                    await energyCertificateBundleLogic.balanceOf(
                        testreceiver.web3Contract._address
                    ),
                    10
                );
            });

            it('should when trying to call safeTransferFrom on retired bundle', async () => {
                let failed = false;
                try {
                    await testreceiver.safeTransferFrom(
                        testreceiver.web3Contract._address,
                        testreceiver.web3Contract._address,
                        15,
                        '0x01',
                        { privateKey: privateKeyDeployment }
                    );
                } catch (ex) {
                    failed = true;
                }

                assert.isTrue(failed);
            });
        });
    });
});
