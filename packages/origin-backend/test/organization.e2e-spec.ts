/* eslint-disable no-return-assign */
import { DeviceStatus, Role } from '@energyweb/origin-backend-core';
import request from 'supertest';

import { Device } from '../src/pods/device/device.entity';
import { registerAndLogin, bootstrapTestInstance } from './origin-backend';

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

        const { accessToken, organization } = await registerAndLogin(
            app,
            configurationService,
            userService,
            organizationService,
            [Role.DeviceManager]
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
            externalDeviceIds: [],
            automaticPostForSale: false,
            defaultAskPrice: 0
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
