import 'mocha';
import { assert } from 'chai';
import * as fs from 'fs';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { buildRights, Role, UserLogic, Contracts as UserRegistryContracts, User } from '@energyweb/user-registry';

import { migrateDeviceRegistryContracts } from '../utils/migrateContracts';
import { DeviceLogic } from '../wrappedContracts/DeviceLogic';
import { DeviceStatus } from '../blockchain-facade/Device';

describe('DeviceLogic', () => {
    dotenv.config({
        path: '.env.test'
    });

    const web3: Web3 = new Web3(process.env.WEB3);
    const deployKey: string = process.env.DEPLOY_KEY;

    const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;

    const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

    let userLogic: UserLogic;
    let deviceLogic: DeviceLogic;

    const deviceOwnerPK = '0xfaab95e72c3ac39f7c060125d9eca3558758bb248d1a4cdc9c1b7fd3f91a4485';
    const deviceOwnerAddress = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

    const deviceSmartmeterPK = '0x2dc5120c26df339dbd9861a0f39a79d87e0638d30fdedc938861beac77bbd3f5';
    const deviceSmartmeter = web3.eth.accounts.privateKeyToAccount(deviceSmartmeterPK).address;

    const deviceSmartmeter2PK = '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed';
    const deviceSmartMeter2 = web3.eth.accounts.privateKeyToAccount(deviceSmartmeter2PK).address;

    const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
    const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

    it('should deploy the contracts', async () => {
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
            buildRights([Role.UserAdmin, Role.DeviceAdmin]),
            { privateKey: privateKeyDeployment }
        );

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            issuerAccount,
            'admin',
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            issuerAccount,
            buildRights([Role.Issuer]),
            { privateKey: privateKeyDeployment }
        );

        deviceLogic = await migrateDeviceRegistryContracts(
            web3,
            userLogic.web3Contract.options.address,
            privateKeyDeployment
        );
    });

    it('should not have any devices in the contract after deployment', async () => {
        assert.equal(await deviceLogic.getDeviceListLength(), 0);
    });

    it('should not deploy an device when the user does not have the deviceManager rights as deviceManager', async () => {
        let failed = false;
        try {
            await deviceLogic.createDevice(
                deviceSmartmeter,
                deviceOwnerAddress,
                DeviceStatus.Active,
                0,
                'propertiesDocumentHash',
                'url',
                {
                    privateKey: deviceOwnerPK
                }
            );
        } catch (ex) {
            failed = true;

            assert.include(ex.message, 'user does not have the required role');
        }
        assert.isTrue(failed);
    });

    it('should not deploy an device when the user does not have the deviceManager rights as user', async () => {
        let failed = false;
        try {
            await deviceLogic.createDevice(
                deviceSmartmeter,
                deviceOwnerAddress,
                DeviceStatus.Active,
                0,
                'propertiesDocumentHash',
                'url',
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }
        assert.isTrue(failed);
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            deviceOwnerAddress,
            'deviceOwner',
            { privateKey: privateKeyDeployment }
        );
        await userLogic.setRoles(
            deviceOwnerAddress,
            buildRights([Role.DeviceManager, Role.DeviceAdmin]),
            {
                privateKey: privateKeyDeployment
            }
        );
    });

    it('should onboard a new device', async () => {
        const tx = await deviceLogic.createDevice(
            deviceSmartmeter,
            deviceOwnerAddress,
            DeviceStatus.Active,
            0,
            'propertiesDocumentHash',
            'url',
            { privateKey: privateKeyDeployment }
        );

        const event = (await deviceLogic.getAllLogDeviceCreatedEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogDeviceCreated');

        assert.deepEqual(event.returnValues, {
            0: accountDeployment,
            1: '0',
            _sender: accountDeployment,
            _deviceId: '0'
        });
    });

    it('should have 1 device in the list', async () => {
        assert.equal(await deviceLogic.getDeviceListLength(), 1);
    });

    it('should return the deployed device correctly', async () => {
        const deployedDevice = await deviceLogic.getDeviceById(0);

        assert.equal(deployedDevice.length, 8);

        assert.equal(deployedDevice.smartMeter, deviceSmartmeter);
        assert.equal(deployedDevice.owner, deviceOwnerAddress);
        assert.equal(deployedDevice.lastSmartMeterReadWh, 0);
        assert.equal(deployedDevice.status, DeviceStatus.Active);
        assert.equal(deployedDevice.usageType, 0);
        assert.equal(deployedDevice.lastSmartMeterReadFileHash, '');
        assert.equal(deployedDevice.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(deployedDevice.url, 'url');
    });

    it('should return device by ID correctly', async () => {
        const device0 = await deviceLogic.getDeviceById(0);

        assert.equal(device0.smartMeter, deviceSmartmeter);
        assert.equal(device0.owner, deviceOwnerAddress);
        assert.equal(device0.lastSmartMeterReadWh, 0);
        assert.equal(device0.status, DeviceStatus.Active);
        assert.equal(device0.lastSmartMeterReadFileHash, '');
        assert.equal(device0.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(device0.url, 'url');
    });

    it('should fail when trying to log with saveSmartMeterRead using the wrong smart meter', async () => {
        let failed = false;

        try {
            await deviceLogic.saveSmartMeterRead(0, 100, 'lastSmartMeterReadFileHash', 0, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: wrong sender');
        }

        assert.isTrue(failed);
    });

    it('should be able log to with saveSmartMeterRead with the right account', async () => {
        const TIMESTAMP = moment().unix();
        const tx = await deviceLogic.saveSmartMeterRead(
            0,
            100,
            'lastSmartMeterReadFileHash',
            TIMESTAMP,
            { privateKey: deviceSmartmeterPK }
        );

        const event = (await deviceLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogNewMeterRead');

        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '0',
            2: '100',
            3: TIMESTAMP.toString(),
            _deviceId: '0',
            _oldMeterRead: '0',
            _newMeterRead: '100',
            _timestamp: TIMESTAMP.toString()
        });
    });

    it('should fail when trying to log with saveSmartMeterRead and a too low meter reading', async () => {
        let failed = false;

        try {
            await deviceLogic.saveSmartMeterRead(0, 50, 'lastSmartMeterReadFileHash', 0, {
                privateKey: deviceSmartmeterPK
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: meter read too low');
        }

        assert.isTrue(failed);
    });

    it('should be able to log with saveSmartMeterRead again using the right values', async () => {
        const TIMESTAMP = moment().unix();

        const tx = await deviceLogic.saveSmartMeterRead(
            0,
            200,
            'lastSmartMeterReadFileHash#2',
            TIMESTAMP,
            { privateKey: deviceSmartmeterPK }
        );

        const event = (await deviceLogic.getAllLogNewMeterReadEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(event.event, 'LogNewMeterRead');

        assert.deepEqual(event.returnValues, {
            0: '0',
            1: '100',
            2: '200',
            3: TIMESTAMP.toString(),
            _deviceId: '0',
            _oldMeterRead: '100',
            _newMeterRead: '200',
            _timestamp: TIMESTAMP.toString()
        });
    });

    it('should fail when trying to change status of device as non-issuer', async () => {
        let failed = false;

        try {
            await deviceLogic.setStatus(0, DeviceStatus.Denied, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate a device', async () => {
        const tx = await deviceLogic.setStatus(0, DeviceStatus.Denied, {
            privateKey: issuerPK
        });

        const statusChangedEvent = (await deviceLogic.getAllLogDeviceStatusChangedEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(statusChangedEvent.event, 'DeviceStatusChanged');
        assert.deepEqual(statusChangedEvent.returnValues, {
            0: '0',
            1: DeviceStatus.Denied.toString(),
            _deviceId: '0',
            _status: DeviceStatus.Denied.toString()
        });
    });

    it('should fail when trying to log with saveSmartMeterRead with a deactivated device', async () => {
        let failed = false;

        try {
            await deviceLogic.saveSmartMeterRead(0, 300, 'lastSmartMeterReadFileHash', 0, {
                privateKey: deviceSmartmeterPK
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'saveSmartMeterRead: device not active');
        }

        assert.isTrue(failed);
    });

    it('should fail when trying to activate a device as a non-issuer', async () => {
        let failed = false;

        try {
            await deviceLogic.setStatus(0, DeviceStatus.Active, {
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            });
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'user does not have the required role');
        }

        assert.isTrue(failed);
    });

    it('should be able to deactivate a device', async () => {
        const tx = await deviceLogic.setStatus(0, DeviceStatus.Denied, {
            privateKey: issuerPK
        });

        const statusChangedEvent = (await deviceLogic.getAllLogDeviceStatusChangedEvents({
            fromBlock: tx.blockNumber,
            toBlock: tx.blockNumber
        }))[0];

        assert.equal(statusChangedEvent.event, 'DeviceStatusChanged');
        assert.deepEqual(statusChangedEvent.returnValues, {
            0: '0',
            1: DeviceStatus.Denied.toString(),
            _deviceId: '0',
            _status: DeviceStatus.Denied.toString()
        });
    });

    it('should return updated device correctly', async () => {
        const device0 = await deviceLogic.getDeviceById(0);

        assert.equal(device0.smartMeter, deviceSmartmeter);
        assert.equal(device0.owner, deviceOwnerAddress);
        assert.equal(device0.lastSmartMeterReadWh, '200');
        assert.equal(device0.status, DeviceStatus.Denied);
        assert.equal(device0.lastSmartMeterReadFileHash, 'lastSmartMeterReadFileHash#2');
        assert.equal(device0.propertiesDocumentHash, 'propertiesDocumentHash');
        assert.equal(device0.url, 'url');
    });

    it('should return the correct latest hashes + meter readings', async () => {
        assert.deepEqual(await deviceLogic.getLastMeterReadingAndHash(0), {
            0: '200',
            1: 'lastSmartMeterReadFileHash#2',
            _lastSmartMeterReadWh: '200',
            _lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash#2'
        });

        it('should fail when trying to return latest hash + meter reading of a non existing device', async () => {
            let failed = false;

            try {
                await deviceLogic.getLastMeterReadingAndHash(1);
            } catch (ex) {
                failed = true;
            }
            assert.isTrue(failed);
        });
    });

    it('should return user registry address', async () => {
        const userLogicAddress = await deviceLogic.userLogicAddress();

        assert.equal(userLogicAddress, userLogic.web3Contract.options.address);
    });
});
