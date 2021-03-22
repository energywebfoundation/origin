/* eslint-disable no-return-assign */
import { DeviceCreateData, DeviceStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import dotenv from 'dotenv';
import { BigNumber } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { bootstrapTestInstance, TestUser } from './test.app';

describe('Device e2e tests', () => {
    dotenv.config({
        path: '.env.test'
    });

    let app: INestApplication;
    let databaseService: DatabaseService;

    const getExampleDevice = (externalDeviceId = '123'): DeviceCreateData => ({
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
        status: DeviceStatus.Active,
        timezone: '',
        typeOfPublicSupport: '',
        deviceGroup: '',
        smartMeterReads: [
            { timestamp: 10000, meterReading: BigNumber.from(100) },
            { timestamp: 11000, meterReading: BigNumber.from(200) },
            { timestamp: 12000, meterReading: BigNumber.from(300) }
        ],
        externalDeviceIds: [{ id: externalDeviceId, type: process.env.ISSUER_ID }]
    });

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('device');
    });

    after(async () => {
        await app.close();
    });

    it('should not allow to register device for non-active organization', async () => {
        await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set({ 'test-user': TestUser.SubmittedOrganizationAdmin })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow to register device for active organization', async () => {
        await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(201);
    });

    it("should not allow deleting device to another Organization's admins", async () => {
        const { body } = await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await request(app.getHttpServer())
            .delete(`/device/${body.id}`)
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not allow storing smart meter readings to other organization device managers', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set({ 'test-user': TestUser.OrganizationAdmin });

        await request(app.getHttpServer())
            .put(`/device/${body.id}/smartMeterReading`)
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .send([
                {
                    meterReading: 12345,
                    timestamp: moment().subtract(1, 'month').unix()
                }
            ])
            .expect(HttpStatus.UNAUTHORIZED);
    });
});
