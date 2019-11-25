import 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { buildRights, Role, UserLogic, Contracts as UserRegistryContracts } from '@energyweb/user-registry';
import { Configuration, Compliance } from '@energyweb/utils-general';

import { AssetLogic, ProducingAsset, Asset, ConsumingAsset } from '..';
import { logger } from '../Logger';
import { migrateAssetRegistryContracts } from '../utils/migrateContracts';
import { OffChainDataClientMock } from '@energyweb/origin-backend-client';

describe('Asset Facade', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    let assetLogic: AssetLogic;
    let userLogic: UserLogic;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    const SM_READ_TIMESTAMP = moment().unix();

    it('should deploy user-registry contracts', async () => {
        userLogic = await UserRegistryContracts.migrateUserRegistryContracts(web3, privateKeyDeployment);

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
    });

    it('should deploy asset-registry contracts', async () => {
        assetLogic = await migrateAssetRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            assetOwnerAddress,
            'assetOwner',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(
            assetOwnerAddress,
            buildRights([Role.AssetManager, Role.AssetAdmin]),
            { privateKey: privateKeyDeployment }
        );
    });

    describe('ProducingAsset', () => {
        it('should onboard a new producing asset', async () => {
            conf = {
                blockchainProperties: {
                    activeUser: {
                        address: accountDeployment,
                        privateKey: privateKeyDeployment
                    },
                    assetLogicInstance: assetLogic,
                    userLogicInstance: userLogic,
                    web3
                },
                offChainDataSource: {
                    baseUrl: `${process.env.BACKEND_URL}/api`,
                    client: new OffChainDataClientMock()
                },
                logger
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';

            const assetProps: Asset.IOnChainProperties = {
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                usageType: Asset.UsageType.Producing,
                lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
                propertiesDocumentHash: null,
                url: null
            };

            const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
                operationalSince: 0,
                capacityWh: 10,
                country: 'Thailand',
                address:
                    '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                gpsLatitude: '0.0123123',
                gpsLongitude: '31.1231',
                timezone: 'Asia/Bangkok',
                assetType: 'Wind',
                complianceRegistry: Compliance.EEC,
                otherGreenAttributes: '',
                typeOfPublicSupport: '',
                facilityName: FACILITY_NAME
            };

            assert.equal(await ProducingAsset.getAssetListLength(conf), 0);

            const asset = await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);

            assert.deepOwnInclude(asset, {
                id: '0',
                initialized: true,
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                usageType: Asset.UsageType.Producing,
                lastSmartMeterReadFileHash: '',
                offChainProperties: assetPropsOffChain,
                url: `${process.env.BACKEND_URL}/api/ProducingAsset/${assetLogic.web3Contract.options.address}`
            } as Partial<ProducingAsset.Entity>);

            assert.equal(await ProducingAsset.getAssetListLength(conf), 1);
        });

        it('should fail when trying to onboard the same asset again', async () => {
            const assetProps: Asset.IOnChainProperties = {
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                usageType: Asset.UsageType.Producing,
                lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
                propertiesDocumentHash: null,
                url: null
            };

            const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
                operationalSince: 0,
                capacityWh: 10,
                country: 'Thailand',
                address:
                    '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                gpsLatitude: '0.0123123',
                gpsLongitude: '31.1231',
                timezone: 'Asia/Bangkok',
                assetType: 'Wind',
                complianceRegistry: Compliance.EEC,
                otherGreenAttributes: '',
                typeOfPublicSupport: '',
                facilityName: 'Wuthering Heights Windfarm'
            };

            assert.equal(await ProducingAsset.getAssetListLength(conf), 1);

            try {
                await ProducingAsset.createAsset(assetProps, assetPropsOffChain, conf);
            } catch (ex) {
                assert.include(ex.message, 'smartmeter does already exist');
            }
            assert.equal(await ProducingAsset.getAssetListLength(conf), 1);
        });

        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartmeter,
                privateKey: assetSmartmeterPK
            };
            let asset = await new ProducingAsset.Entity('0', conf).sync();

            await asset.saveSmartMeterRead(100, 'newFileHash', SM_READ_TIMESTAMP);

            asset = await asset.sync();

            assert.deepOwnInclude(asset, {
                id: '0',
                initialized: true,
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 100,
                active: true,
                usageType: Asset.UsageType.Producing,
                lastSmartMeterReadFileHash: 'newFileHash',
                url: `${process.env.BACKEND_URL}/api/ProducingAsset/${assetLogic.web3Contract.options.address}`,
                offChainProperties: {
                    operationalSince: 0,
                    capacityWh: 10,
                    country: 'Thailand',
                    address:
                        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                    gpsLatitude: '0.0123123',
                    gpsLongitude: '31.1231',
                    timezone: 'Asia/Bangkok',
                    assetType: 'Wind',
                    complianceRegistry: Compliance.EEC,
                    otherGreenAttributes: '',
                    typeOfPublicSupport: '',
                    facilityName: 'Wuthering Heights Windfarm'
                }
            } as Partial<ProducingAsset.Entity>);
        });

        describe('getSmartMeterReads', () => {
            it('should correctly return reads', async () => {
                const asset = await new ProducingAsset.Entity('0', conf).sync();
                const reads = await asset.getSmartMeterReads();

                assert.deepEqual(reads, [
                    {
                        energy: 100,
                        timestamp: SM_READ_TIMESTAMP
                    }
                ]);
            });
        });
    });

    describe('ConsumingAsset', () => {
        it('should onboard a new consuming asset', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetOwnerAddress,
                privateKey: assetOwnerPK
            };

            const FACILITY_NAME = 'Wuthering Heights Windfarm';
    
            const assetProps: Asset.IOnChainProperties = {
                smartMeter: { address: assetSmartMeter2 },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                usageType: Asset.UsageType.Consuming,
                lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
                propertiesDocumentHash: null,
                url: null
            };
    
            const assetPropsOffChain: Asset.IOffChainProperties = {
                operationalSince: 0,
                capacityWh: 10,
                country: 'Thailand',
                address:
                    '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                gpsLatitude: '0.0123123',
                gpsLongitude: '31.1231',
                timezone: 'Asia/Bangkok',
                facilityName: FACILITY_NAME
            };
    
            assert.equal(await ConsumingAsset.getAssetListLength(conf), 0);
    
            const asset = await ConsumingAsset.createAsset(assetProps, assetPropsOffChain, conf);
    
            assert.deepOwnInclude(asset, {
                initialized: true,
                smartMeter: { address: assetSmartMeter2 },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 0,
                active: true,
                usageType: Asset.UsageType.Consuming,
                lastSmartMeterReadFileHash: '',
                offChainProperties: assetPropsOffChain,
                url: `${process.env.BACKEND_URL}/api/ConsumingAsset/${assetLogic.web3Contract.options.address}`
            } as Partial<ConsumingAsset.Entity>);
    
            assert.equal(await ConsumingAsset.getAssetListLength(conf), 1);
        });
    
        it('should log a new meter reading', async () => {
            conf.blockchainProperties.activeUser = {
                address: assetSmartMeter2,
                privateKey: assetSmartmeter2PK
            };
            let asset = (await ConsumingAsset.getAllAssets(conf))[0];
            asset = await asset.sync();
    
            await asset.saveSmartMeterRead(100, 'newFileHash', SM_READ_TIMESTAMP);
    
            asset = await asset.sync();
    
            assert.deepOwnInclude(asset, {
                id: '1',
                initialized: true,
                smartMeter: { address: assetSmartMeter2 },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: 100,
                active: true,
                usageType: Asset.UsageType.Consuming,
                lastSmartMeterReadFileHash: 'newFileHash',
                url: `${process.env.BACKEND_URL}/api/ConsumingAsset/${assetLogic.web3Contract.options.address}`,
                offChainProperties: {
                    operationalSince: 0,
                    capacityWh: 10,
                    country: 'Thailand',
                    address:
                        '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
                    gpsLatitude: '0.0123123',
                    gpsLongitude: '31.1231',
                    timezone: 'Asia/Bangkok',
                    facilityName: 'Wuthering Heights Windfarm'
                }
            } as Partial<ConsumingAsset.Entity>);
        });
    
        describe('getSmartMeterReads ConsumingAsset', () => {
            it('should correctly return reads', async () => {
                let asset = (await ConsumingAsset.getAllAssets(conf))[0];
                asset = await asset.sync();
                const reads = await asset.getSmartMeterReads();
    
                assert.deepEqual(reads, [
                    {
                        energy: 100,
                        timestamp: SM_READ_TIMESTAMP
                    }
                ]);
            });
        });
    });

});
