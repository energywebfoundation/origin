/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';

import { AppModule } from '../src/app.module';
import { Connect } from '../src/connect/connect.entity';
import { ConnectService } from '../src/connect/connect.service';
import { Registration } from '../src/registration/registration.entity';
import { RegistrationService } from '../src/registration/registration.service';

export enum TestUser {
    OrganizationAdmin = '0',
    OtherOrganizationAdmin = '1',
    PlatformAdmin = '2'
}

export const testUsers = new Map([
    [
        TestUser.OrganizationAdmin,
        {
            id: 1,
            organization: { id: '1000' },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        }
    ],
    [
        TestUser.OtherOrganizationAdmin,
        {
            id: 2,
            organization: { id: '1001' },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        }
    ],
    [
        TestUser.PlatformAdmin,
        { id: 3, organization: { id: '1002' }, status: UserStatus.Active, rights: Role.Admin }
    ]
]);

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = testUsers.get(req.headers['test-user']);

        return true;
    }
};

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
                entities: [Connect, Registration],
                logging: ['info']
            }),
            AppModule
        ],
        providers: [DatabaseService]
    })
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .compile();

    const app = moduleFixture.createNestApplication();

    const registrationService = await app.resolve<RegistrationService>(RegistrationService);
    const connectService = await app.resolve<ConnectService>(ConnectService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);

    app.useLogger(testLogger);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        registrationService,
        connectService,
        databaseService,
        app
    };
};
