/* eslint-disable no-return-assign */
import { DeviceStatus } from '@energyweb/origin-backend-core';
import request from 'supertest';

import { Device } from '../src/pods/device';
import { basicSetup, bootstrapTestInstance } from './origin-backend';

describe('Organization e2e tests', () => {
    it('should return organization devices only', async () => {
        const {
            app,
            userService,
            databaseService,
            deviceService,
            organizationService,
            configurationService
        } = await bootstrapTestInstance();

        await app.init();

        await databaseService.cleanUp();

        const { accessToken, organization } = await basicSetup(
            app,
            configurationService,
            userService,
            organizationService
        );

        await deviceService.create({
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
            organization: organization.id,
            otherGreenAttributes: '',
            province: '',
            region: '',
            status: DeviceStatus.Active,
            timezone: '',
            typeOfPublicSupport: '',
            deviceGroup: '',
            smartMeterReads: [],
            externalDeviceIds: []
        });

        await request(app.getHttpServer())
            .get(`/organization/${organization.id}/devices`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const devices = res.body as Device[];

                expect(devices).toHaveLength(1);
            });

        await app.close();
    });
});
