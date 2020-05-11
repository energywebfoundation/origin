/* eslint-disable no-return-assign */
import {
    DeviceStatus,
    IDeviceWithRelationsIds,
    DeviceSettingsUpdateData,
    Role
} from '@energyweb/origin-backend-core';
import request from 'supertest';

import moment from 'moment';
import { bigNumberify } from 'ethers/utils';
import { registerAndLogin, bootstrapTestInstance } from './origin-backend';

describe('Device e2e tests', () => {
    jest.setTimeout(1000000);

    it('should allow to edit settings for organization member with DeviceManager role', async () => {
        const {
            app,
            userService,
            deviceService,
            organizationService,
            configurationService
        } = await bootstrapTestInstance();

        await app.init();

        const { accessToken, user } = await registerAndLogin(
            app,
            configurationService,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager]
        );

        const { id: deviceId } = await deviceService.create(
            {
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
                smartMeterReads: [],
                externalDeviceIds: [],
                automaticPostForSale: false,
                defaultAskPrice: null
            },
            user
        );

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

    it('should return certified and uncertified readings', async () => {
        const {
            app,
            userService,
            deviceService,
            organizationService,
            configurationService,
            certificationRequestService
        } = await bootstrapTestInstance();

        await app.init();

        const { accessToken, user } = await registerAndLogin(
            app,
            configurationService,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager]
        );

        const device = await deviceService.create(
            {
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
                smartMeterReads: [],
                externalDeviceIds: [],
                automaticPostForSale: false,
                defaultAskPrice: null
            },
            user
        );

        await request(app.getHttpServer())
            .get(`/device/${device.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const resultDevice = res.body as IDeviceWithRelationsIds;

                expect(bigNumberify(resultDevice.meterStats.certified).toNumber()).toBe(0);
                expect(bigNumberify(resultDevice.meterStats.uncertified).toNumber()).toBe(0);
            });

        const now = moment();
        const firstSmRead = {
            meterReading: 12345,
            timestamp: now.clone().subtract(1, 'month').unix()
        };

        await request(app.getHttpServer())
            .put(`/device/${device.id}/smartMeterReading`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(firstSmRead)
            .expect(200);

        const secondSmRead = {
            meterReading: 54321,
            timestamp: now.unix()
        };

        await request(app.getHttpServer())
            .put(`/device/${device.id}/smartMeterReading`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(secondSmRead)
            .expect(200);

        await certificationRequestService.create({
            id: 1,
            owner: '0xD173313A51f8fc37BcF67569b463abd89d81844f',
            fromTime: moment().subtract(2, 'month').unix(),
            toTime: moment().subtract(10, 'day').unix(),
            device,
            approved: false,
            revoked: false,
            created: moment().subtract(1, 'day').unix(),
            userId: user.organizationId.toString()
        });

        await certificationRequestService.registerApproved(1);

        await request(app.getHttpServer())
            .get(`/device/${device.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const resultDevice = res.body as IDeviceWithRelationsIds;

                expect(bigNumberify(resultDevice.meterStats.certified).toNumber()).toBeGreaterThan(
                    0
                );
            });

        await app.close();
    });
});
