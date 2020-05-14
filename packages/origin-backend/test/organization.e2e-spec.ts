/* eslint-disable no-return-assign */
import {
    DeviceStatus,
    Role,
    UserRegistrationData,
    OrganizationInvitationStatus,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { Device } from '../src/pods/device/device.entity';
import { DeviceService } from '../src/pods/device/device.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService, TUserBaseEntity } from '../src/pods/user';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';

describe('Organization e2e tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let deviceService: DeviceService;
    let organizationService: OrganizationService;
    let userService: UserService;

    beforeAll(async () => {
        ({
            app,
            databaseService,
            deviceService,
            organizationService,
            userService
        } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('user');
        await databaseService.truncate('organization');
    });

    afterAll(async () => {
        await app.close();
    });

    it('should allow user to invite and then accept invitation', async () => {
        const { accessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        const newUserEmail = 'newuser@example.com';
        const password = 'password';

        await request(app.getHttpServer())
            .post('/organization/invite')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: newUserEmail })
            .expect(201);

        const newUserRegistration: UserRegistrationData = {
            email: newUserEmail,
            title: 'Marquess',
            firstName: 'Random',
            lastName: 'Dude',
            password,
            telephone: '123'
        };

        await request(app.getHttpServer())
            .post('/user/register')
            .send(newUserRegistration)
            .expect(201);

        let newUserAccessToken;

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: newUserEmail,
                password
            })
            .expect(201)
            .expect((res) => ({ accessToken: newUserAccessToken } = res.body));

        let invitationId;

        await request(app.getHttpServer())
            .get(`/organization/invitation`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .expect(200)
            .expect((res) => {
                const [invitation] = res.body as IOrganizationInvitation[];

                expect(invitation).toBeDefined();
                expect(invitation.organization).toBe(organization.id);

                invitationId = invitation.id;
            });

        await request(app.getHttpServer())
            .put(`/organization/invitation/${invitationId}`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .send({ status: OrganizationInvitationStatus.Accepted })
            .expect(200);

        await request(app.getHttpServer())
            .get(`/user/me`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .expect((res) => {
                const user = res.body as TUserBaseEntity;

                expect(user.organization).toBe(organization.id);
                expect(user.rights).toBe(Role.OrganizationUser);
            });
    });

    it('should return organization devices only', async () => {
        const { accessToken, user, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationDeviceManager]
        );

        await deviceService.create(
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
                defaultAskPrice: 0
            },
            user
        );

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
