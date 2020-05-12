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

    beforeAll(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('user');
    });

    afterAll(async () => {
        await app.close();
    });

    it('should be able to register user', async () => {
        await request(app.getHttpServer())
            .post(`/user/register`)
            .send(userToRegister)
            .expect((res) => {
                const user = res.body as IUser;

                expect(user.email).toBe(userToRegister.email);
                expect(user.organization).toBeUndefined();
                expect(user.rights).toBe(buildRights([Role.OrganizationAdmin]));
                expect(user.status).toBe(Status.Pending);
                expect(user.kycStatus).toBe(KYCStatus['Pending KYC']);
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

                expect(user.email).toBe(userToRegister.email);
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
