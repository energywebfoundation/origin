/* eslint-disable no-return-assign */
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import dotenv from 'dotenv';
import { expect } from 'chai';
import supertest from 'supertest';

import { CreateDeviceDTO } from '../src/device';
import { request } from './request';
import { bootstrapTestInstance, TestUser } from './test.app';
import { PublicDeviceDTO } from '../src/device/dto/public-device.dto';

describe('Device e2e tests', () => {
    dotenv.config({
        path: '.env.test'
    });

    let app: INestApplication;
    let databaseService: DatabaseService;
    let test: supertest.SuperTest<supertest.Test>;

    const exampleDevice: CreateDeviceDTO = {
        name: 'Test solar device',
        code: 'TESTDEVICE001',
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
            .put(`/irec/device-registry/${body.id}`)
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
            .put(`/irec/device-registry/${body.id}`)
            .send({ status: DeviceStatus.Active })
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK);
    });

    it('should not expose all fields as public devices', async () => {
        const { body } = await test
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await test.get(`/irec/device-registry/${body.id}`).expect((res) => {
            const device = res.body as PublicDeviceDTO;

            expect((device as any).defaultAccount).to.be.undefined;
            expect(device.name).to.not.be.undefined;
        });
    });
});
