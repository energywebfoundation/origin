/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    IPublicOrganization,
    LoggedInUser,
    OrganizationStatus,
    Role,
    UserRegistrationData,
    UserStatus
} from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import request from 'supertest';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import { ConfigurationService } from '../src/pods/configuration';
import { EmailConfirmationService } from '../src/pods/email-confirmation/email-confirmation.service';
import { FileService } from '../src/pods/file/file.service';
import { InvitationService } from '../src/pods/invitation/invitation.service';
import { NewOrganizationDTO } from '../src/pods/organization/dto/new-organization.dto';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';

export const getExampleOrganization = (
    email = 'test@example.com',
    name = 'default'
): NewOrganizationDTO => ({
    name: `Example ${name} Organization`,
    address: 'Address',
    businessType: 'Public',
    city: 'City',
    zipCode: 'Code',
    country: 'DE',
    tradeRegistryCompanyNumber: '1234',
    vatNumber: '1234',
    signatoryAddress: 'Address',
    signatoryCity: 'City',
    signatoryCountry: 'DE',
    signatoryEmail: email,
    signatoryFullName: 'Organization Signatory',
    signatoryPhoneNumber: '1234',
    signatoryZipCode: 'Code'
});

export const bootstrapTestInstance = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT ?? 5432),
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info']
            }),
            AppModule
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
    const configurationService = await app.resolve<ConfigurationService>(ConfigurationService);
    const emailConfirmationService = await app.resolve<EmailConfirmationService>(
        EmailConfirmationService
    );
    const fileService = await app.resolve<FileService>(FileService);
    const invitationService = await app.resolve<InvitationService>(InvitationService);

    app.useLogger(['log', 'error']);
    app.enableCors();

    await databaseService.cleanUp();

    await configurationService.update({});

    return {
        app,
        databaseService,
        userService,
        organizationService,
        configurationService,
        emailConfirmationService,
        fileService,
        invitationService
    };
};

export const loginUser = async (app: any, username: string, password: string): Promise<string> => {
    let accessToken;
    await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            username,
            password
        })
        .expect((res) => ({ accessToken } = res.body));

    return accessToken;
};

export const registerAndLogin = async (
    app: any,
    userService: UserService,
    organizationService: OrganizationService,
    roles: Role[] = [Role.OrganizationAdmin],
    userSeed = 'default',
    orgSeed = 'default',
    organizationStatus = OrganizationStatus.Submitted
) => {
    const userEmail = `user${userSeed}@example.com`;

    let user = await userService.findOne({ email: userEmail });
    if (!user) {
        const userRegistration: UserRegistrationData = {
            email: userEmail,
            password: '123',
            firstName: 'Name',
            lastName: 'Name',
            title: 'Sir',
            telephone: '991'
        };
        const { id: userId } = await userService.create(userRegistration);
        await userService.changeRole(userId, ...roles);

        user = await userService.findOne({ email: userEmail });
        user.status = UserStatus.Active;
        await userService.update(userId, user);
    }

    const organizationEmail = `org${orgSeed}@example.com`;

    let organization = await organizationService.findOne(null, {
        where: { signatoryEmail: organizationEmail }
    });

    if (!organization) {
        const organizationRegistration = getExampleOrganization(organizationEmail, orgSeed);

        await organizationService.create(new LoggedInUser(user), organizationRegistration);
        organization = await organizationService.findOne(null, {
            where: { signatoryEmail: organizationEmail }
        });
        if (organizationStatus !== OrganizationStatus.Submitted) {
            await organizationService.update(organization.id, organizationStatus);
        }
    } else {
        await userService.addToOrganization(user.id, organization.id);
    }

    user.organization = { id: organization.id } as IPublicOrganization;

    const accessToken = await loginUser(app, user.email, '123');

    return { accessToken, user: new LoggedInUser(user), organization };
};
