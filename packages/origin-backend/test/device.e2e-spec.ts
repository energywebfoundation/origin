/* eslint-disable no-return-assign */
import {
    DeviceStatus,
    IDeviceWithRelationsIds,
    DeviceSettingsUpdateData,
    Role
} from '@energyweb/origin-backend-core';
import request from 'supertest';

import { registerAndLogin, bootstrapTestInstance } from './origin-backend';

describe('Device e2e tests', () => {
    it('should allow to edit settings for organization member with DeviceManager role', async () => {
        const {
            app,
            userService,
            deviceService,
            organizationService,
            configurationService
        } = await bootstrapTestInstance();

        await app.init();

        const { accessToken, organization } = await registerAndLogin(
            app,
            configurationService,
            userService,
            organizationService,
            [Role.Trader, Role.DeviceManager]
        );

        const { id: deviceId } = await deviceService.create({
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
            defaultAskPrice: null
        });

        await request(app.getHttpServer())
            .get(`/device/${deviceId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const device = res.body as IDeviceWithRelationsIds;

                expect(device.defaultAskPrice).toBe(null);
                expect(device.automaticPostForSale).toBe(false);
            });

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(422);

        const settingWithZeroPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 0,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithZeroPrice)
            .expect(422);

        const settingWithNonIntegerPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 1.3,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithNonIntegerPrice)
            .expect(422);

        const settingWithCorrectPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 1000,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithCorrectPrice)
            .expect(200);

        await request(app.getHttpServer())
            .get(`/device/${deviceId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const device = res.body as IDeviceWithRelationsIds;

                expect(device.defaultAskPrice).toBe(settingWithCorrectPrice.defaultAskPrice);
                expect(device.automaticPostForSale).toBe(true);
            });

        await app.close();
    });
});
