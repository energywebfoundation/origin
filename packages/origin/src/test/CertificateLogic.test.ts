import { assert } from 'chai';
import 'mocha';
import Web3 from 'web3';
import dotenv from 'dotenv';

import {
    UserLogic,
    Role,
    buildRights,
    Contracts as UserRegistryContracts
} from '@energyweb/user-registry';
import {
    Device,
    ProducingDevice,
    DeviceLogic,
    Contracts as DeviceRegistryContracts
} from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';
import { IDevice, DeviceStatus } from '@energyweb/origin-backend-core';

import { deployERC721TestReceiver } from './deploy';
import { TestReceiver } from '../wrappedContracts/TestReceiver';
import { CertificateLogic, Certificate } from '..';
import { migrateCertificateRegistryContracts } from '../utils/migrateContracts';
import { logger } from '../blockchain-facade/Logger';

describe('CertificateLogic-Facade', () => {
    let userLogic: UserLogic;
    let deviceLogic: DeviceLogic;
    let certificateLogic: CertificateLogic;

    let testReceiver: TestReceiver;

    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    const deviceOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
    const accountDeviceOwner = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const traderPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
    const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

    const deviceSmartmeterPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const deviceSmartmeter = web3.eth.accounts.privateKeyToAccount(deviceSmartmeterPK).address;

    const approvedPK = '0x60a0dae29ff80793b6cc1602f60fbe548b6787d0f9d4eb7c0967dac8ff11591a';
    const approvedAccount = web3.eth.accounts.privateKeyToAccount(approvedPK).address;

    const issuerPK = '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    let conf: Configuration.Entity;
    let blockCreationTime: number;
    let device: ProducingDevice.Entity;

    function setActiveUser(privateKey: string) {
        conf.blockchainProperties.activeUser = {
            address: web3.eth.accounts.privateKeyToAccount(privateKey).address,
            privateKey
        };
    }

    const createCertificate = async (energy: number) =>
        certificateLogic.createArbitraryCertfificate(0, energy, '', {
            privateKey: issuerPK
        });

    async function generateCertificateAndGetId(energy = 100): Promise<string> {
        const LAST_SMART_METER_READ = device.lastSmartMeterReadWh;

        setActiveUser(deviceOwnerPK);

        await device.saveSmartMeterRead(0, LAST_SMART_METER_READ + energy);
        await certificateLogic.createArbitraryCertfificate(0, energy, '', {
            privateKey: issuerPK
        });

        return (Number(await Certificate.getCertificateListLength(conf)) - 1).toString(); // latestCertificateId
    }

    it('should deploy the contracts', async () => {
        userLogic = await UserRegistryContracts.migrateUserRegistryContracts(
            web3,
            privateKeyDeployment
        );

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', accountDeployment, {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(
            accountDeployment,
            buildRights([Role.UserAdmin, Role.DeviceAdmin]),
            { privateKey: privateKeyDeployment }
        );

        deviceLogic = await DeviceRegistryContracts.migrateDeviceRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );

        certificateLogic = await migrateCertificateRegistryContracts(
            web3,
            deviceLogic.web3Contract.options.address,
            privateKeyDeployment
        );

        conf = {
            blockchainProperties: {
                activeUser: {
                    address: accountDeployment,
                    privateKey: privateKeyDeployment
                },
                deviceLogicInstance: deviceLogic,
                userLogicInstance: userLogic,
                certificateLogicInstance: certificateLogic,
                web3
            },
            offChainDataSource: new OffChainDataSourceMock(),
            logger
        };
    });

    it('should return correct balances', async () => {
        assert.equal(await Certificate.getCertificateListLength(conf), 0);
        assert.equal(await certificateLogic.balanceOf(accountDeviceOwner), 0);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 0);
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', accountDeviceOwner, {
            privateKey: privateKeyDeployment
        });

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', accountTrader, {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(accountTrader, buildRights([Role.Trader]), {
            privateKey: privateKeyDeployment
        });
        await userLogic.setRoles(
            accountDeviceOwner,
            buildRights([Role.DeviceManager, Role.Trader]),
            {
                privateKey: privateKeyDeployment
            }
        );

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', issuerAccount, {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(issuerAccount, buildRights([Role.Issuer]), {
            privateKey: privateKeyDeployment
        });
    });

    it('should onboard a new device', async () => {
        const deviceProps: Device.IOnChainProperties = {
            smartMeter: { address: deviceSmartmeter },
            owner: { address: accountDeviceOwner }
        };

        const devicePropsOffChain: Omit<IDevice, 'id'> = {
            status: DeviceStatus.Active,
            facilityName: 'TestFacility',
            operationalSince: 0,
            capacityInW: 10,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '14.059500',
            gpsLongitude: '99.977800',
            timezone: 'Asia/Bangkok',
            deviceType: 'Wind',
            complianceRegistry: 'I-REC',
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: '',
            images: '',
            region: '',
            province: '',
            smartMeterReads: []
        };

        assert.equal(await ProducingDevice.getDeviceListLength(conf), 0);

        device = await ProducingDevice.createDevice(deviceProps, devicePropsOffChain, conf);

        assert.equal(await ProducingDevice.getDeviceListLength(conf), 1);
    });

    it('should log a new meterreading', async () => {
        await device.saveSmartMeterRead(0, 100);
    });

    it('should be able to create arbitrary certificate', async () => {
        await certificateLogic.createArbitraryCertfificate(0, 100, '', {
            privateKey: issuerPK
        });

        assert.equal(await Certificate.getCertificateListLength(conf), 1);
        assert.equal(await certificateLogic.balanceOf(accountDeviceOwner), 1);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 0);
    });

    it('should return certificate', async () => {
        const certificate = await new Certificate.Entity('0', conf).sync();

        assert.equal(certificate.owner, accountDeviceOwner);

        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);

        assert.deepOwnInclude(certificate, {
            id: '0',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 0
        } as Partial<Certificate.Entity>);
    });

    it('should transfer certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        let certificate = await new Certificate.Entity('0', conf).sync();

        await certificate.transferFrom(accountTrader);

        certificate = await certificate.sync();

        assert.equal(await Certificate.getCertificateListLength(conf), 1);
        assert.equal(await certificateLogic.balanceOf(accountDeviceOwner), 0);
        assert.equal(await certificateLogic.balanceOf(accountTrader), 1);
        assert.equal(certificate.owner, accountTrader);

        assert.deepOwnInclude(certificate, {
            id: '0',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountTrader,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 0
        } as Partial<Certificate.Entity>);
    });

    it('create a new certificate (#1)', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };
        await device.saveSmartMeterRead(0, 200);

        await createCertificate(100);

        const certificate = await new Certificate.Entity('1', conf).sync();

        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);
        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1
        } as Partial<Certificate.Entity>);
    });

    it('should approve', async () => {
        let certificate = await new Certificate.Entity('1', conf).sync();

        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000000');

        await certificate.approve('0x0000000000000000000000000000000000000001');
        assert.equal(await certificate.getApproved(), '0x0000000000000000000000000000000000000001');

        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '1',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 1
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#2)', async () => {
        await device.saveSmartMeterRead(0, 300);

        await createCertificate(100);

        const certificate = await new Certificate.Entity('2', conf).sync();
        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);

        assert.deepOwnInclude(certificate, {
            id: '2',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2
        } as Partial<Certificate.Entity>);
    });

    it('should split a certificate', async () => {
        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        let certificate = await new Certificate.Entity('2', conf).sync();

        await certificate.splitCertificate(60);

        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '2',
            initialized: true,
            deviceId: 0,
            children: ['3', '4'],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Split,
            creationTime: blockCreationTime,
            parentId: 2
        } as Partial<Certificate.Entity>);

        const c1 = await new Certificate.Entity('3', conf).sync();
        const c2 = await new Certificate.Entity('4', conf).sync();

        assert.deepOwnInclude(c1, {
            id: '3',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 60,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2
        } as Partial<Certificate.Entity>);

        assert.deepOwnInclude(c2, {
            id: '4',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 40,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 2
        } as Partial<Certificate.Entity>);

        const activeCerts = await Certificate.getActiveCertificates(conf);
        const activeIndices = activeCerts.map(cert => cert.id);

        assert.equal(activeIndices.indexOf(certificate.id), -1);
        assert.notEqual(activeIndices.indexOf(c1.id), -1);
        assert.notEqual(activeIndices.indexOf(c2.id), -1);
    });

    it('should retire a certificate', async () => {
        let certificate = await new Certificate.Entity('3', conf).sync();

        await certificate.claim();

        certificate = await certificate.sync();

        assert.isTrue(await certificate.isClaimed());
        assert.equal(certificate.owner, accountDeviceOwner);

        assert.deepOwnInclude(certificate, {
            id: '3',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 60,
            status: Certificate.Status.Claimed,
            creationTime: blockCreationTime,
            parentId: 2
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#5)', async () => {
        await device.saveSmartMeterRead(0, 400);

        await createCertificate(100);

        const certificate = await new Certificate.Entity('5', conf).sync();

        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);
        assert.deepOwnInclude(certificate, {
            id: '5',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 5
        } as Partial<Certificate.Entity>);
    });

    it('should be able to use safeTransferFrom without calldata', async () => {
        const testReceiverAddress = (
            await deployERC721TestReceiver(
                web3,
                certificateLogic.web3Contract.options.address,
                privateKeyDeployment
            )
        ).contractAddress;

        testReceiver = new TestReceiver(web3, testReceiverAddress);

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', testReceiverAddress, {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(testReceiverAddress, buildRights([Role.DeviceManager]), {
            privateKey: privateKeyDeployment
        });
        let certificate = await new Certificate.Entity('5', conf).sync();

        await certificate.safeTransferFrom(testReceiverAddress);

        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '5',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: testReceiverAddress,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 5
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#6)', async () => {
        await device.saveSmartMeterRead(0, 500);

        await createCertificate(100);

        const certificate = await new Certificate.Entity('6', conf).sync();

        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);
        assert.deepOwnInclude(certificate, {
            id: '6',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 6
        } as Partial<Certificate.Entity>);
    });

    it('should be able to use safeTransferFrom', async () => {
        const testReceiverAddress = (
            await deployERC721TestReceiver(
                web3,
                certificateLogic.web3Contract.options.address,
                privateKeyDeployment
            )
        ).contractAddress;

        testReceiver = new TestReceiver(web3, testReceiverAddress);

        await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', testReceiverAddress, {
            privateKey: privateKeyDeployment
        });

        await userLogic.setRoles(testReceiverAddress, buildRights([Role.DeviceManager]), {
            privateKey: privateKeyDeployment
        });
        let certificate = await new Certificate.Entity('6', conf).sync();

        await certificate.safeTransferFrom(testReceiverAddress, '0x001');

        certificate = await certificate.sync();

        assert.deepOwnInclude(certificate, {
            id: '6',
            initialized: true,
            deviceId: 0,
            children: [],
            owner: testReceiverAddress,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: 6
        } as Partial<Certificate.Entity>);
    });

    it('should create a new certificate (#10)', async () => {
        const STARTING_CERTIFICATE_LENGTH = Number(
            await Certificate.getCertificateListLength(conf)
        );

        const LAST_SMART_METER_READ = device.lastSmartMeterReadWh;

        conf.blockchainProperties.activeUser = {
            address: accountDeviceOwner,
            privateKey: deviceOwnerPK
        };

        await device.saveSmartMeterRead(0, LAST_SMART_METER_READ + 100);

        await createCertificate(100);

        const certificate = await new Certificate.Entity(
            STARTING_CERTIFICATE_LENGTH.toString(),
            conf
        ).sync();

        blockCreationTime = parseInt((await web3.eth.getBlock('latest')).timestamp.toString(), 10);
        assert.deepOwnInclude(certificate, {
            id: STARTING_CERTIFICATE_LENGTH.toString(),
            initialized: true,
            deviceId: 0,
            children: [],
            owner: accountDeviceOwner,
            energy: 100,
            status: Certificate.Status.Active,
            creationTime: blockCreationTime,
            parentId: STARTING_CERTIFICATE_LENGTH
        } as Partial<Certificate.Entity>);
    });

    it('should bulk claim certificates', async () => {
        setActiveUser(deviceOwnerPK);

        const certificatesToClaim = [
            await generateCertificateAndGetId(),
            await generateCertificateAndGetId()
        ];

        for (const certificateId of certificatesToClaim) {
            const certificate = await new Certificate.Entity(certificateId, conf).sync();

            assert.equal(certificate.status, Certificate.Status.Active);
        }

        await certificateLogic.claimCertificateBulk(
            certificatesToClaim.map(cId => parseInt(cId, 10)),
            {
                privateKey: deviceOwnerPK
            }
        );

        for (const certificateId of certificatesToClaim) {
            const certificate = await new Certificate.Entity(certificateId, conf).sync();

            assert.equal(certificate.status, Certificate.Status.Claimed);
        }
    });

    it('should return asset device address', async () => {
        const deviceLogicAddress = await certificateLogic.deviceLogicAddress();

        assert.equal(deviceLogicAddress, deviceLogic.web3Contract.options.address);
    });
});
