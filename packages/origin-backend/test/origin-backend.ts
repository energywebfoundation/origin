/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    buildRights,
    OrganizationPostData,
    Role,
    UserRegisterData
} from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { ConfigurationService } from '../src/pods/configuration';
import { DeviceService } from '../src/pods/device';
import { OrganizationService } from '../src/pods/organization';
import { UserService } from '../src/pods/user';
import { DatabaseService } from './database.service';

const testLogger = new Logger('e2e');

export const bootstrapTestInstance = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule.register(null)],
        providers: [DatabaseService]
    }).compile();

    const app = moduleFixture.createNestApplication();

    const userService = await app.resolve<UserService>(UserService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const organizationService = await app.resolve<OrganizationService>(OrganizationService);
    const deviceService = await app.resolve<DeviceService>(DeviceService);
    const configurationService = await app.resolve<ConfigurationService>(ConfigurationService);

    app.useLogger(testLogger);
    app.enableCors();

    return {
        app,
        databaseService,
        userService,
        testLogger,
        organizationService,
        deviceService,
        configurationService
    };
};

export const registerAndLogin = async (
    app: any,
    configurationService: ConfigurationService,
    userService: UserService,
    organizationService: OrganizationService,
    roles: Role[] = [Role.UserAdmin],
    userNonce = 0,
    orgNonce = 0
) => {
    await configurationService.update({
        contractsLookup: { registry: '', issuer: '' }
    });

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
            telephone: '991'
        };
        await userService.create(userRegistration);
        user = await userService.findOne({ email: userEmail });
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

    let accessToken: string;

    await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            username: user.email,
            password: '123'
        })
        .expect((res) => ({ accessToken } = res.body));

    return { accessToken, user, organization };
};
