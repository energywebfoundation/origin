import 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { buildRights, Role, UserLogic, Contracts as UserRegistryContracts } from '@energyweb/user-registry';

import { migrateDeviceRegistryContracts } from '../utils/migrateContracts';
import { DeviceLogic } from '../wrappedContracts/DeviceLogic';

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

    const traderAndDeviceManagerPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const traderAndDeviceManagerAddress = web3.eth.accounts.privateKeyToAccount(traderAndDeviceManagerPK).address;

    it('should deploy the contracts', async () => {
        userLogic = await UserRegistryContracts.migrateUserRegistryContracts(web3, privateKeyDeployment);

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            accountDeployment,
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
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            issuerAccount,
            buildRights([Role.Issuer]),
            { privateKey: privateKeyDeployment }
        );

        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            traderAndDeviceManagerAddress,
            { privateKey: privateKeyDeployment }
        );

        await userLogic.setRoles(
            traderAndDeviceManagerAddress,
            buildRights([Role.Trader, Role.DeviceManager]),
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
                {
                    privateKey: deviceOwnerPK
                }
            );
        } catch (ex) {
            failed = true;

            assert.include(ex.message, 'revert device owner has to have device manager role');
        }
        assert.isTrue(failed);
    });

    it('should not deploy an device when the user does not have the deviceManager rights as user', async () => {
        let failed = false;
        try {
            await deviceLogic.createDevice(
                deviceSmartmeter,
                deviceOwnerAddress,
                {
                    privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(ex.message, 'revert device owner has to have device manager role');
        }
        assert.isTrue(failed);
    });

    it('should onboard tests-users', async () => {
        await userLogic.createUser(
            'propertiesDocumentHash',
            'documentDBURL',
            deviceOwnerAddress,
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

    it('should not create active device when the user does not have the device admin/manager rights as user', async () => {
        let failed = false;
        try {
            await deviceLogic.createDevice(
                deviceSmartmeter,
                deviceSmartmeter,
                {
                    privateKey: deviceSmartmeterPK
                }
            );
        } catch (ex) {
            failed = true;
            assert.include(
                ex.message,
                'device owner has to have device manager role'
            );
        }
        assert.isTrue(failed);
    });

    it('should onboard a new device', async () => {
        const tx = await deviceLogic.createDevice(
            deviceSmartmeter,
            deviceOwnerAddress,
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

        assert.equal(deployedDevice.length, 3);

        assert.equal(deployedDevice.smartMeter, deviceSmartmeter);
        assert.equal(deployedDevice.owner, deviceOwnerAddress);
        assert.equal(deployedDevice.lastSmartMeterReadWh, 0);
    });

    it('should return device by ID correctly', async () => {
        const device0 = await deviceLogic.getDeviceById(0);

        assert.equal(device0.smartMeter, deviceSmartmeter);
        assert.equal(device0.owner, deviceOwnerAddress);

    });

    it('should return updated device correctly', async () => {
        const device0 = await deviceLogic.getDeviceById(0);

        assert.equal(device0.smartMeter, deviceSmartmeter);
        assert.equal(device0.owner, deviceOwnerAddress);
    });

    it('should return user registry address', async () => {
        const userLogicAddress = await deviceLogic.userLogicAddress();

        assert.equal(userLogicAddress, userLogic.web3Contract.options.address);
    });
});
