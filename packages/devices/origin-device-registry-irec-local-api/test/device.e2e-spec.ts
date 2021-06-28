/* eslint-disable no-return-assign */
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import dotenv from 'dotenv';
import { expect } from 'chai';
import supertest from 'supertest';

import { CreateDeviceDTO, PublicDeviceDTO } from '../src';
import { request } from './request';
import { bootstrapTestInstance, TestUser } from './test.app';

describe('Device e2e tests', () => {
    dotenv.config({
        path: '.env.test'
    });

    let app: INestApplication;
    let databaseService: DatabaseService;
    let test: supertest.SuperTest<supertest.Test>;

    const exampleDevice: CreateDeviceDTO = {
        name: 'Test solar device',
        deviceType: 'TC110',
        fuelType: 'ES100',
        countryCode: 'TH',
        capacity: 1000,
        commissioningDate: new Date('2020-01-01'),
        registrationDate: new Date('2020-01-02'),
        address: '1 Wind Farm Avenue, Thailand',
        latitude: '10',
        longitude: '10',
        gridOperator: 'OP',
        timezone: 'Asia/Bangkok',
        postalCode: '12345',
        region: 'Some place',
        subregion: 'Another place'
    };

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);
    });

    beforeEach(async () => {
        await databaseService.truncate('irec_device_registry_device');
    });

    after(async () => {
        await app.close();
    });

    it('should not allow to register device for non-active organization', async () => {
        await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.SubmittedOrganizationAdmin })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow to register device for active organization', async () => {
        await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);
    });

    it('should not expose all fields as public devices', async () => {
        const { body } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        const { body: device }: { body: PublicDeviceDTO } = await test.get(
            `/irec/device-registry/device/${body.id}`
        );
        expect((device as any).defaultAccount).to.be.undefined;
        expect(device.name).to.not.be.undefined;

        const { body: devices }: { body: PublicDeviceDTO[] } = await test.get(
            `/irec/device-registry`
        );

        expect(devices).to.have.lengthOf(1);
        expect(devices[0]).to.deep.equal(device);
    });

    it('should return irec device types', async () => {
        const { body: fuels } = await test.get('/irec/device-registry/device-type');

        expect(fuels).to.be.an('array');
        fuels.forEach((fuel: any) => {
            expect(fuel).to.be.an('object');
            expect(fuel.code).to.be.a('string');
            expect(fuel.name).to.be.a('string');
        });
    });

    it('should return irec fuels types', async () => {
        const { body: fuelTypes } = await test.get('/irec/device-registry/fuel-type');

        expect(fuelTypes).to.be.an('array');
        fuelTypes.forEach((fuelType: any) => {
            expect(fuelType).to.be.an('object');
            expect(fuelType.code).to.be.a('string');
            expect(fuelType.name).to.be.a('string');
        });
    });

    it('should return my devices', async () => {
        const { body: device } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(device.status).to.equal(DeviceState.InProgress);

        const { body: myDevices } = await test
            .get('/irec/device-registry/my-devices')
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(myDevices).to.be.an('array');
        expect(myDevices[0].id).to.equal(device.id);
        expect(myDevices[0].code).to.equal(device.code);
    });

    it('should update device data', async () => {
        const { body: device } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(device.status).to.equal(DeviceState.InProgress);

        await test
            .put(`/irec/device-registry/device/${device.id}`)
            .send({
                status: DeviceState.Approved, // the status should not change
                name: 'Changed Name'
            })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);

        const { body: updatedDevice }: { body: PublicDeviceDTO } = await test.get(
            `/irec/device-registry/device/${device.id}`
        );

        expect(updatedDevice.status).to.equal(DeviceState.InProgress);
        expect(updatedDevice.name).to.equal('Changed Name');
    });

    it('should import irec device to local irec device storage', async () => {
        const {
            body: [deviceToImport]
        } = await test
            .get('/irec/device-registry/irec-devices-to-import')
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(deviceToImport.code).to.be.a('string');

        const { body: createdDevice } = await test
            .post('/irec/device-registry/import-irec-device')
            .send({
                code: deviceToImport.code,
                timezone: 'some',
                gridOperator: 'some',
                country: 'TH',
                postalCode: '12345',
                region: 'Shire',
                subregion: 'Hobbiton'
            })
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(createdDevice.id).to.be.a('string');
    });

    it('should pass reject/approve device flow', async () => {
        const { body: newDevice } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);
        expect(newDevice.status).to.equal(DeviceState.InProgress);

        const { body: rejectedDevice } = await test
            .put(`/irec/device-registry/${newDevice.id}/status`)
            .send({ status: DeviceState.Rejected })
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK);
        expect(rejectedDevice.status).to.equal(DeviceState.Rejected);

        const { body: updatedDevice } = await test
            .put(`/irec/device-registry/device/${newDevice.id}`)
            .send({ name: 'Changed Name' })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.OK);
        expect(updatedDevice.status).to.equal(DeviceState.InProgress);

        const { body: approvedDevice } = await test
            .put(`/irec/device-registry/${newDevice.id}/status`)
            .send({ status: DeviceState.Approved })
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK);
        expect(approvedDevice.status).to.equal(DeviceState.Approved);
    });
});
