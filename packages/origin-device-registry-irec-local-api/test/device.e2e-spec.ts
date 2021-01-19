/* eslint-disable no-return-assign */
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import dotenv from 'dotenv';
import request from 'supertest';

import { CreateDeviceDTO } from '../src/device';
import { bootstrapTestInstance, TestUser } from './test.app';

describe('Device e2e tests', () => {
    dotenv.config({
        path: '.env.test'
    });

    let app: INestApplication;
    let databaseService: DatabaseService;

    const exampleDevice: CreateDeviceDTO = {
        address: '',
        capacityInW: 1000,
        complianceRegistry: 'I-REC',
        country: 'EU',
        description: '',
        deviceType: 'Solar',
        facilityName: 'Test',
        gpsLatitude: '10',
        gpsLongitude: '10',
        gridOperator: 'OP',
        images: '',
        operationalSince: 2000,
        otherGreenAttributes: '',
        province: '',
        region: '',
        timezone: '',
        typeOfPublicSupport: ''
    };

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('irec_device_registry_device');
    });

    after(async () => {
        await app.close();
    });

    it('should not allow to register device for non-active organization', async () => {
        await request(app.getHttpServer())
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.SubmittedOrganizationAdmin })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should not allow organization admin to approve the device', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await request(app.getHttpServer())
            .put(`/irec/device-registry/${body.id}`)
            .send({ status: DeviceStatus.Active })
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow to register device for active organization', async () => {
        await request(app.getHttpServer())
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);
    });

    it('should allow platform admin to approve the device', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/irec/device-registry')
            .send(exampleDevice)
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await request(app.getHttpServer())
            .put(`/irec/device-registry/${body.id}`)
            .send({ status: DeviceStatus.Active })
            .set({ 'test-user': TestUser.PlatformAdmin })
            .expect(HttpStatus.OK);
    });
});
