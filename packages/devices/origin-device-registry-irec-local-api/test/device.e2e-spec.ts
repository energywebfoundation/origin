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
        defaultAccount: 'MYTRADEACCOUNT001',
        deviceType: 'ES100',
        fuel: 'TC110',
        countryCode: 'TH',
        capacity: 1000,
        commissioningDate: new Date('2020-01-01'),
        registrationDate: new Date('2020-01-02'),
        address: '1 Wind Farm Avenue, Thailand',
        latitude: '10',
        longitude: '10',
        gridOperator: 'OP',
        timezone: 'Asia/Bangkok'
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
            .send({ code: deviceToImport.code, timezone: 'some', gridOperator: 'some' })
            .set({ 'test-user': TestUser.OrganizationAdmin });

        expect(createdDevice.id).to.be.a('string');
    });
});
