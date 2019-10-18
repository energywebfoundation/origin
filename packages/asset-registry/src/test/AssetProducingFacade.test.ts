import 'mocha';

import { buildRights, Role, UserContractLookup, UserLogic } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { Configuration, Compliance } from '@energyweb/utils-general';
import { assert } from 'chai';
import * as fs from 'fs';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { AssetProducingRegistryLogic, ProducingAsset } from '..';
import { logger } from '../Logger';
import { migrateAssetRegistryContracts } from '../utils/migrateContracts';

describe('AssetProducing Facade', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;
    let conf: Configuration.Entity;

    let userContractLookup: UserContractLookup;
    let userContractLookupAddr: string;
    let assetProducingLogic: AssetProducingRegistryLogic;
    let userLogic: UserLogic;

    const assetOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

    const assetSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const assetSmartmeter = web3.eth.accounts.privateKeyToAccount(assetSmartmeterPK).address;

    const assetSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const assetSmartMeter2 = web3.eth.accounts.privateKeyToAccount(assetSmartmeter2PK).address;

    const SM_READ_TIMESTAMP = moment().unix();

    it('should deploy user-registry contracts', async () => {
        const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);
        userContractLookupAddr = (userContracts as any).UserContractLookup;
        userLogic = new UserLogic(web3, (userContracts as any).UserLogic);

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

        userContractLookup = new UserContractLookup(web3, userContractLookupAddr);
    });

    it('should deploy asset-registry contracts', async () => {
        const deployedContracts = await migrateAssetRegistryContracts(
            web3,
            userContractLookupAddr,
            privateKeyDeployment
        );
        assetProducingLogic = new AssetProducingRegistryLogic(
            web3,
            (deployedContracts as any).AssetProducingRegistryLogic
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

    it('should onboard a new asset', async () => {
        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                producingAssetLogicInstance: assetProducingLogic,
                userLogicInstance: userLogic,
                web3
            },
            offChainDataSource: {
                baseUrl: `${process.env.BACKEND_URL}/api`
            },
            logger
        };

        const FACILITY_NAME = 'Wuthering Heights Windfarm';

        const assetProps: ProducingAsset.IOnChainProperties = {
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            propertiesDocumentHash: null,
            url: null,
            maxOwnerChanges: 3
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
        delete asset.configuration;
        delete asset.proofs;
        delete asset.propertiesDocumentHash;

        assert.deepEqual(
            {
                id: '0',
                initialized: true,
                smartMeter: { address: assetSmartmeter },
                owner: { address: assetOwnerAddress },
                lastSmartMeterReadWh: '0',
                active: true,
                lastSmartMeterReadFileHash: '',
                offChainProperties: assetPropsOffChain,
                maxOwnerChanges: '3',
                url: `${process.env.BACKEND_URL}/api/ProducingAsset/${assetProducingLogic.web3Contract.options.address}`
            } as any,
            asset
        );
        assert.equal(await ProducingAsset.getAssetListLength(conf), 1);
    });

    it('should fail when trying to onboard the same asset again', async () => {
        const assetProps: ProducingAsset.IOnChainProperties = {
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
            propertiesDocumentHash: null,
            url: null,
            maxOwnerChanges: 3
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

        delete asset.proofs;
        delete asset.configuration;

        delete asset.propertiesDocumentHash;

        assert.deepEqual(asset as any, {
            id: '0',
            initialized: true,
            smartMeter: { address: assetSmartmeter },
            owner: { address: assetOwnerAddress },
            lastSmartMeterReadWh: '100',
            active: true,
            lastSmartMeterReadFileHash: 'newFileHash',
            url: `${process.env.BACKEND_URL}/api/ProducingAsset/${assetProducingLogic.web3Contract.options.address}`,
            maxOwnerChanges: '3',
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
        });
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
