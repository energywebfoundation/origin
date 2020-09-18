/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { DeviceStatus, getRolesFromRights, Role } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { Device } from '../src/pods/device/device.entity';
import { DeviceService } from '../src/pods/device/device.service';
import { OrganizationInvitationDTO } from '../src/pods/organization/organization-invitation.dto';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { PublicOrganizationInfoDTO } from '../src/pods/organization/public-organization-info.dto';
import { TUserBaseEntity, UserService } from '../src/pods/user';
import { bootstrapTestInstance, getExampleOrganization, registerAndLogin } from './origin-backend';
import { userToRegister } from './user.e2e-spec';

describe('Organization e2e tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let deviceService: DeviceService;
    let organizationService: OrganizationService;
    let userService: UserService;

    before(async () => {
        try {
            ({
                app,
                databaseService,
                deviceService,
                organizationService,
                userService
            } = await bootstrapTestInstance());

            await app.init();
        } catch (e) {
            console.error(e);
        }
    });

    beforeEach(async () => {
        await databaseService.truncate('user', 'platform_organization');
    });

    after(async () => {
        await app.close();
    });

    it('should allow platform owner to read all organizations', async () => {
        const { accessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.Admin]
        );

        await request(app.getHttpServer())
            .get('/organization')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
                const [org] = res.body as PublicOrganizationInfoDTO[];

                console.log(org);

                expect(org.id).to.be.equal(organization.id);
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
            .expect(200)
            .expect((res) => {
                const devices = res.body as Device[];

                expect(devices).to.have.length(1);
            });
    });

    it('should be able to remove organization member when organization admin', async () => {
        const { accessToken: adminAccessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        const { user: member, accessToken: memberAccessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'member'
        );

        await request(app.getHttpServer())
            .post(`/organization/${organization.id}/remove-member/${member.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .expect(201);

        await request(app.getHttpServer())
            .get(`/user/me`)
            .set('Authorization', `Bearer ${memberAccessToken}`)
            .expect(200)
            .expect((res) => {
                const { organization: memberOrganization } = res.body as TUserBaseEntity;
                expect(memberOrganization).to.be.null;
            });
    });

    it('should be able to get invitations for organization', async () => {
        const { accessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        const newUserEmail = 'newuser@example.com';

        await request(app.getHttpServer())
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: newUserEmail, role: Role.OrganizationUser })
            .expect(201);

        await request(app.getHttpServer())
            .get(`/organization/${organization.id}/invitations`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
                const [invitation] = res.body as OrganizationInvitationDTO[];

                expect(invitation).to.be.ok;
            });
    });

    it('should fail to get invitations for different organization', async () => {
        const { accessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        await request(app.getHttpServer())
            .get(`/organization/${organization.id + 1}/invitations`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(403);
    });

    it('should be able to change role for organization member when organization admin', async () => {
        const { accessToken: adminAccessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        const { user: member, accessToken: memberAccessToken } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'member'
        );

        await request(app.getHttpServer())
            .put(`/organization/${organization.id}/change-role/${member.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                role: Role.OrganizationDeviceManager
            })
            .expect(200);

        await request(app.getHttpServer())
            .get(`/user/me`)
            .set('Authorization', `Bearer ${memberAccessToken}`)
            .expect(200)
            .expect((res) => {
                const { rights } = res.body as TUserBaseEntity;
                expect(getRolesFromRights(rights)).contain(Role.OrganizationDeviceManager);
            });
    });

    it('should not be able to change role for admin or support when organization admin', async () => {
        const { accessToken: adminAccessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin]
        );

        const { user: member } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'member'
        );

        await request(app.getHttpServer())
            .put(`/organization/${organization.id}/change-role/${member.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                role: Role.Admin
            })
            .expect(403);

        await request(app.getHttpServer())
            .put(`/organization/${organization.id}/change-role/${member.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                role: Role.SupportAgent
            })
            .expect(403);

        await request(app.getHttpServer())
            .put(`/organization/${organization.id}/change-role/${member.id}`)
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send({
                role: Role.Issuer
            })
            .expect(403);
    });

    it('should be able to see information about own organization', async () => {
        const { accessToken, organization } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser]
        );

        await request(app.getHttpServer())
            .get(`/organization/${organization.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });

    it('should be not able to see information about a different organization', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationUser
        ]);

        const { organization: org2 } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'org2',
            'org2'
        );

        await request(app.getHttpServer())
            .get(`/organization/${org2.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(403);
    });

    it('should return all organizations if Admin or Support Agent', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.Admin
        ]);

        await request(app.getHttpServer())
            .get(`/organization`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        const { accessToken: accessToken2 } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.SupportAgent]
        );

        await request(app.getHttpServer())
            .get(`/organization`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .expect(200);
    });

    it('should not return all organizations if not Admin or Support Agent', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationUser,
            Role.OrganizationDeviceManager,
            Role.OrganizationAdmin
        ]);

        await request(app.getHttpServer())
            .get(`/organization`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(403);
    });

    it('should be able to register organization before being approved user', async () => {
        await request(app.getHttpServer()).post(`/user/register`).send(userToRegister).expect(201);

        let accessToken: string;

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: userToRegister.email,
                password: userToRegister.password
            })
            .expect((res) => ({ accessToken } = res.body));

        const organization = getExampleOrganization();
        await request(app.getHttpServer())
            .post(`/organization`)
            .send(organization)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201);
    });
});
