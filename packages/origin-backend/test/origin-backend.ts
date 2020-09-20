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
import { signTypedMessagePrivateKey } from '@energyweb/utils-general';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import request from 'supertest';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import { CertificateService } from '../src/pods/certificate/certificate.service';
import { CertificationRequestService } from '../src/pods/certification-request/certification-request.service';
import { ConfigurationService } from '../src/pods/configuration';
import { DeviceService } from '../src/pods/device/device.service';
import { EmailConfirmationService } from '../src/pods/email-confirmation/email-confirmation.service';
import { FileService } from '../src/pods/file/file.service';
import { InvitationService } from '../src/pods/invitation/invitation.service';
import { NewOrganizationDTO } from '../src/pods/organization/new-organization.dto';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';

const testLogger = new Logger('e2e');

export const getExampleOrganization = (email = 'test@example.com'): NewOrganizationDTO => ({
    name: 'Example Organization',
    address: 'Address',
    businessType: 'Public',
    city: 'City',
    zipCode: 'Code',
    country: 1,
    tradeRegistryCompanyNumber: '1234',
    vatNumber: '1234',
    signatoryAddress: 'Address',
    signatoryCity: 'City',
    signatoryCountry: 1,
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
    const certificateService = await app.resolve<CertificateService>(CertificateService);
    const certificationRequestService = await app.resolve<CertificationRequestService>(
        CertificationRequestService
    );
    const emailConfirmationService = await app.resolve<EmailConfirmationService>(
        EmailConfirmationService
    );
    const fileService = await app.resolve<FileService>(FileService);
    const invitationService = await app.resolve<InvitationService>(InvitationService);

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
        certificateService,
        certificationRequestService,
        emailConfirmationService,
        fileService,
        invitationService
    };
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
        const signedMessage = await signTypedMessagePrivateKey(
            ethers.Wallet.createRandom().privateKey.substring(2),
            process.env.REGISTRATION_MESSAGE_TO_SIGN
        );

        user = await userService.attachSignedMessage(user.id, signedMessage);
    }

    const organizationEmail = `org${orgSeed}@example.com`;

    let organization = await organizationService.findOne(null, {
        where: { signatoryEmail: organizationEmail }
    });

    if (!organization) {
        const organizationRegistration = getExampleOrganization(organizationEmail);

        await organizationService.create(user.id, organizationRegistration);
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
