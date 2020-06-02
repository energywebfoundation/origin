/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import {
    buildRights,
    IUser,
    KYCStatus,
    Role,
    Status,
    UserRegistrationData
} from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './origin-backend';
import { omit } from './utils';

describe('User e2e tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    const userToRegister: UserRegistrationData = {
        title: 'Mr',
        firstName: 'John',
        lastName: 'Rambo',
        email: 'john@example.com',
        password: 'FirstBlood',
        telephone: '+11'
    };

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('user');
    });

    after(async () => {
        await app.close();
    });

    it('should be able to register user', async () => {
        await request(app.getHttpServer())
            .post(`/user/register`)
            .send(userToRegister)
            .expect((res) => {
                const user = res.body as IUser;

                expect(user.email).equals(userToRegister.email);
                expect(user.organization).to.be.undefined;
                expect(user.rights).equals(buildRights([Role.OrganizationAdmin]));
                expect(user.status).equals(Status.Pending);
                expect(user.kycStatus).equals(KYCStatus['Pending KYC']);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((user as any).password).to.be.undefined;
            });

        let accessToken: string;

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: userToRegister.email,
                password: userToRegister.password
            })
            .expect((res) => ({ accessToken } = res.body));

        await request(app.getHttpServer())
            .get(`/user/me`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect((res) => {
                const user = res.body as IUser;

                expect(user.email).equals(userToRegister.email);
            });
    });

    it('should not be able to register user with the same email', async () => {
        await request(app.getHttpServer()).post(`/user/register`).send(userToRegister).expect(201);

        const otherUserWithSameEmail: UserRegistrationData = {
            ...userToRegister,
            firstName: 'Samuel',
            lastName: 'Trautman'
        };

        await request(app.getHttpServer())
            .post(`/user/register`)
            .send(otherUserWithSameEmail)
            .expect(409);
    });

    it('should not be able to register user with missing input data', async () => {
        await request(app.getHttpServer())
            .post(`/user/register`)
            .send(omit(userToRegister, 'password'))
            .expect(400);
    });
});
