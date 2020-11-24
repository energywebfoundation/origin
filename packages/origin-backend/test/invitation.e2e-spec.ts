/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import {
    IOrganizationInvitation,
    OrganizationInvitationStatus,
    Role,
    UserRegistrationData,
    UserStatus
} from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { OrganizationService } from '../src/pods/organization/organization.service';
import { TUserBaseEntity, UserService } from '../src/pods/user';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';

describe('Invitation e2e tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let organizationService: OrganizationService;
    let userService: UserService;
    // let invitationService: InvitationService;

    before(async () => {
        try {
            ({
                app,
                databaseService,
                organizationService,
                userService
                // invitationService
            } = await bootstrapTestInstance());

            await app.init();
        } catch (e) {
            console.error(e);
        }
    });

    beforeEach(async () => {
        await databaseService.truncate('user', 'platform_organization', 'organization_invitation');
    });

    after(async () => {
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
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: newUserEmail, role: Role.OrganizationUser })
            .expect(HttpStatus.CREATED);

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
            .expect(HttpStatus.CREATED);

        let newUserAccessToken;

        const invitedUser = await userService.findOne({ email: newUserEmail });
        invitedUser.status = UserStatus.Active;
        await userService.update(invitedUser.id, invitedUser);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: newUserEmail,
                password
            })
            .expect(HttpStatus.OK)
            .expect((res) => ({ accessToken: newUserAccessToken } = res.body));

        let invitationId;

        await request(app.getHttpServer())
            .get(`/invitation`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const [invitation] = res.body as IOrganizationInvitation[];

                expect(invitation).to.be.ok;
                expect(invitation.organization.id).equals(organization.id);

                invitationId = invitation.id;
            });

        await request(app.getHttpServer())
            .put(`/invitation/${invitationId}/${OrganizationInvitationStatus.Accepted}`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .get(`/user/me`)
            .set('Authorization', `Bearer ${newUserAccessToken}`)
            .expect((res) => {
                const user = res.body as TUserBaseEntity;

                expect(user.organization?.id).equals(organization.id);
                expect(user.rights).equals(Role.OrganizationUser);
            });
    });

    it('should not allow to invite the platform admin or support from org admin', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.Admin
        ]);

        await request(app.getHttpServer())
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: 'random@example.com', role: Role.Admin })
            .expect(HttpStatus.FORBIDDEN);

        await request(app.getHttpServer())
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ email: 'random@example.com', role: Role.SupportAgent })
            .expect(HttpStatus.FORBIDDEN);

        await request(app.getHttpServer())
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                email: 'random@example.com',
                role: Role.OrganizationDeviceManager | Role.SupportAgent
            })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should not allow to accept invitation by the user that is already part of the other organization', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationAdmin
        ]);

        const { user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationAdmin],
            'second',
            'second'
        );

        await request(app.getHttpServer())
            .post('/invitation')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                email: user.email,
                role: Role.OrganizationDeviceManager
            })
            .expect(HttpStatus.FORBIDDEN);
    });
});
