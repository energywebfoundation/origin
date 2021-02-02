/* eslint-disable no-return-assign */
import {
    DeviceSettingsUpdateData,
    DeviceStatus,
    Role,
    ILoggedInUser,
    DeviceCreateData,
    OrganizationStatus,
    IDevice
} from '@energyweb/origin-backend-core';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import moment from 'moment';
import request from 'supertest';
import dotenv from 'dotenv';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';
import { IDeviceService } from '../src/pods/device/device.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user/user.service';

describe('Device e2e tests', () => {
    dotenv.config({
        path: '.env.test'
    });

    let app: INestApplication;
    let deviceService: IDeviceService;
    let organizationService: OrganizationService;
    let userService: UserService;
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
        externalDeviceIds: [{ id: externalDeviceId, type: process.env.ISSUER_ID }],
        automaticPostForSale: false
    });

    const createDevice = (user: ILoggedInUser, externalDeviceId = '123') =>
        deviceService.create(getExampleDevice(externalDeviceId), user);

    before(async () => {
        ({
            app,
            deviceService,
            organizationService,
            userService,
            databaseService
        } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('user', 'platform_organization', 'device');
    });

    after(async () => {
        await app.close();
    });

    it('should not allow to register device for non-active organization', async () => {
        const { accessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager],
            'default',
            'default',
            OrganizationStatus.Submitted
        );

        await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow to register device for active organization', async () => {
        const { accessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager],
            'default',
            'default',
            OrganizationStatus.Active
        );

        await request(app.getHttpServer())
            .post('/device')
            .send(getExampleDevice())
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201);
    });

    it('should allow to edit settings for organization member with DeviceManager role', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager]
        );

        const { id: deviceId } = await createDevice(user);

        await request(app.getHttpServer())
            .get(`/device/${deviceId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const device = res.body as IDevice;
                expect(device.defaultAskPrice).equals(null);
                expect(device.automaticPostForSale).equals(false);
            });

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.BAD_REQUEST);

        const settingWithZeroPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 0,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithZeroPrice)
            .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        const settingWithNonIntegerPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 1.3,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithNonIntegerPrice)
            .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        const settingWithCorrectPrice: DeviceSettingsUpdateData = {
            defaultAskPrice: 1000,
            automaticPostForSale: true
        };

        await request(app.getHttpServer())
            .put(`/device/${deviceId}/settings`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(settingWithCorrectPrice)
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .get(`/device/${deviceId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const device = res.body as IDevice;

                expect(device.defaultAskPrice).equals(settingWithCorrectPrice.defaultAskPrice);
                expect(device.automaticPostForSale).equals(true);
            });
    });

    it("should not allow deleting device to another Organization's admins", async () => {
        const { user: orgAdmin } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationAdmin
        ]);

        const { accessToken: accessTokenOtherOrgAdmin } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin],
            'default2',
            'default2'
        );

        const { id: deviceId } = await createDevice(orgAdmin);

        await request(app.getHttpServer())
            .delete(`/device/${deviceId}`)
            .set('Authorization', `Bearer ${accessTokenOtherOrgAdmin}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    // it('should return certified and uncertified readings', async () => {
    //     const { accessToken, user } = await registerAndLogin(
    //         app,
    //         userService,
    //         organizationService,
    //         [Role.OrganizationUser, Role.OrganizationDeviceManager]
    //     );

    //     const externalDeviceId = '123';

    //     const device = await createDevice(user, externalDeviceId);

    //     await request(app.getHttpServer())
    //         .get(`/device/${device.id}?withMeterStats=true`)
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .expect((res) => {
    //             const resultDevice = res.body as IDevice;

    //             const [firstRead] = resultDevice.smartMeterReads;

    //             expect(BigNumber.from(resultDevice.meterStats.certified).toNumber()).equals(0);
    //             expect(BigNumber.from(resultDevice.meterStats.uncertified).toNumber()).equals(300);

    //             expect(BigNumber.from(firstRead.timestamp).toNumber()).equals(10000);
    //             expect(BigNumber.from(firstRead.meterReading).toNumber()).equals(100);
    //         });

    //     const now = moment();
    //     const firstSmRead = {
    //         meterReading: 12345,
    //         timestamp: now.clone().subtract(1, 'month').unix()
    //     };

    //     await request(app.getHttpServer())
    //         .put(`/device/${device.id}/smartMeterReading`)
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send([firstSmRead])
    //         .expect(HttpStatus.OK);

    //     const secondSmRead = {
    //         meterReading: 54321,
    //         timestamp: now.unix()
    //     };

    //     await request(app.getHttpServer())
    //         .put(`/device/${device.id}/smartMeterReading`)
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send([secondSmRead])
    //         .expect(HttpStatus.OK);

    //     const fromTime = moment().subtract(2, 'month').unix();
    //     const toTime = moment().subtract(10, 'day').unix();

    //     await certificationRequestService.queue(
    //         {
    //             deviceId: externalDeviceId,
    //             fromTime,
    //             toTime,
    //             energy: '100000',
    //             files: ['./test.pdf', './test2.pdf']
    //         },
    //         user
    //     );

    //     await certificationRequestService.create({
    //         id: 1,
    //         owner: '0xD173313A51f8fc37BcF67569b463abd89d81844f',
    //         fromTime,
    //         toTime,
    //         device,
    //         approved: false,
    //         revoked: false,
    //         created: moment().subtract(1, 'day').unix(),
    //         userId: user.organizationId.toString()
    //     });

    //     await certificationRequestService.registerApproved(1);

    //     await request(app.getHttpServer())
    //         .get(`/device/${device.id}?withMeterStats=true`)
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .expect((res) => {
    //             const resultDevice = res.body as IDevice;

    //             expect(
    //                 BigNumber.from(resultDevice.meterStats.certified).toNumber()
    //             ).to.be.greaterThan(0);
    //         });
    // });

    it('should not allow storing smart meter readings to other organization device managers', async () => {
        const { user } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationUser,
            Role.OrganizationDeviceManager
        ]);

        const { accessToken: accessTokenDifferentDeviceManager } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser, Role.OrganizationDeviceManager],
            'default2',
            'default2'
        );

        const device = await createDevice(user);

        await request(app.getHttpServer())
            .put(`/device/${device.id}/smartMeterReading`)
            .set('Authorization', `Bearer ${accessTokenDifferentDeviceManager}`)
            .send([
                {
                    meterReading: 12345,
                    timestamp: moment().subtract(1, 'month').unix()
                }
            ])
            .expect(HttpStatus.UNAUTHORIZED);
    });
});
