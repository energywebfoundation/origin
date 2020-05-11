/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    buildRights,
    LoggedInUser,
    OrganizationPostData,
    Role,
    UserRegisterData
} from '@energyweb/origin-backend-core';
import { signTypedMessagePrivateKey } from '@energyweb/utils-general';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import request from 'supertest';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import { CertificationRequestService } from '../src/pods/certificate/certification-request.service';
import { ConfigurationService } from '../src/pods/configuration';
import { DeviceService } from '../src/pods/device/device.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';
import { DatabaseService } from './database.service';

const testLogger = new Logger('e2e');

export const bootstrapTestInstance = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT) ?? 5432,
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info']
            }),
            AppModule.register(null)
        ],
        providers: [DatabaseService]
    }).compile();

    dotenv.config({
        path: '.env.test'
    });

    const app = moduleFixture.createNestApplication();

    const userService = await app.resolve<UserService>(UserService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const organizationService = await app.resolve<OrganizationService>(OrganizationService);
    const deviceService = await app.resolve<DeviceService>(DeviceService);
    const configurationService = await app.resolve<ConfigurationService>(ConfigurationService);
    const certificationRequestService = await app.resolve<CertificationRequestService>(
        CertificationRequestService
    );

    app.useLogger(testLogger);
    app.enableCors();

    await databaseService.cleanUp();

    await configurationService.update({
        contractsLookup: { registry: '', issuer: '' }
    });

    return {
        app,
        databaseService,
        userService,
        testLogger,
        organizationService,
        deviceService,
        configurationService,
        certificationRequestService
    };
};

export const registerAndLogin = async (
    app: any,
    configurationService: ConfigurationService,
    userService: UserService,
    organizationService: OrganizationService,
    roles: Role[] = [Role.OrganizationAdmin],
    userNonce = 0,
    orgNonce = 0
) => {
    const userEmail = `user${userNonce}@example.com`;

    let user = await userService.findOne({ email: userEmail });
    if (!user) {
        const userRegistration: UserRegisterData = {
            email: userEmail,
            password: '123',
            firstName: 'Name',
            lastName: 'Name',
            title: 'Sir',
            rights: buildRights(roles),
            telephone: '991',
            status: 0,
            kycStatus: 0,
            notifications: true
        };
        await userService.create(userRegistration);
        user = await userService.findOne({ email: userEmail });

        const signedMessage = await signTypedMessagePrivateKey(
            'd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
            process.env.REGISTRATION_MESSAGE_TO_SIGN
        );

        user = await userService.attachSignedMessage(user.id, signedMessage);
    }

    const organizationEmail = `org${orgNonce}@example.com`;

    let organization = await organizationService.findOne(null, {
        where: { email: organizationEmail }
    });

    if (!organization) {
        const organizationRegistration = {
            email: organizationEmail,
            code: '',
            contact: '',
            telephone: '',
            address: '',
            shareholders: '',
            ceoName: 'John',
            vatNumber: '',
            postcode: '',
            businessTypeSelect: '',
            businessTypeInput: '',
            activeCountries: 'EU',
            name: 'Test',
            ceoPassportNumber: '1',
            companyNumber: '2',
            headquartersCountry: 1,
            country: 1,
            yearOfRegistration: 2000,
            numberOfEmployees: 1,
            website: 'http://example.com'
        } as OrganizationPostData;

        await organizationService.create(user.id, organizationRegistration);
        organization = await organizationService.findOne(null, {
            where: { email: organizationEmail }
        });
    }

    user.organization = organization.id;

    let accessToken: string;

    await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            username: user.email,
            password: '123'
        })
        .expect((res) => ({ accessToken } = res.body));

    return { accessToken, user: new LoggedInUser(user), organization };
};
