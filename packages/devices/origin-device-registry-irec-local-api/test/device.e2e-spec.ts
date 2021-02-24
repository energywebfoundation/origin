/* eslint-disable no-return-assign */
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
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
        deviceType: 'TC140',
        fuel: 'ES100',
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

    it('should not allow organization admin to approve the device', async () => {
        const { body } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await test
            .put(`/irec/device-registry/device/${body.id}/status`)
            .send({ status: DeviceStatus.Active })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow to register device for active organization', async () => {
        await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);
    });

    it('should allow platform admin to approve the device', async () => {
        const { body } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await test
            .put(`/irec/device-registry/device/${body.id}/status`)
            .send({ status: DeviceState.Approved })
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK);
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
});
