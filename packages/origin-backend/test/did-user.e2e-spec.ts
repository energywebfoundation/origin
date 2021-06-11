/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';
import { bootstrapTestInstance } from './origin-backend';

describe('DID user e2e tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let organizationService: OrganizationService;
    let userService: UserService;

    before(async () => {
        ({
            app,
            databaseService,
            organizationService,
            userService
            // invitationService
        } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('user', 'platform_organization', 'organization_invitation');
    });

    after(async () => {
        await app.close();
    });

    describe('Anonymous user, without having a valid accessToken', function () {
        it('should not be able to register as DID user', async function () {
            this.skip(); // TODO: implement test
        });
    });

    describe('Existing DID', function () {
        describe('when not registered on Origin', function () {
            it('should be able to login using auth/login-did endpoint', function () {
                this.skip(); // TODO: implement test
            });

            it('should not be able to request guarded endpoints', function () {
                this.skip(); // TODO: implement test
            });

            it('should be able to register an account on Origin using user/register-did endpoint', function () {
                this.skip(); // TODO: implement test
            });

            describe('Origin REST API access token', function () {
                it('should contain verifiedRoles field containing on-chain roles', function () {
                    this.skip(); // TODO: implement test
                });
            });

            describe('then, user table record', function () {
                it('should be created', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have did field set to on-chain did', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have password field set to null', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have rights record set according to on-chain roles', function () {
                    this.skip(); // TODO: implement test
                });
            });
        });

        describe('when registered on Origin', function () {
            it('should be able to log in', function () {
                this.skip(); // TODO: implement test
            });

            it('should be able to request guarded endpoints', function () {
                this.skip(); // TODO: implement test
            });

            describe('user rights field', function () {
                it('should be updated to reflect on-chain roles on every REST API request', function () {
                    this.skip(); // TODO: implement test
                });
            });
        });
    });
});
