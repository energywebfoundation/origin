/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ILoggedInUser,
    IUser,
    OrganizationStatus,
    Role,
    UserStatus
} from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Connection, Registration } from '@energyweb/origin-organization-irec-api';

import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';

import {
    DeviceCreateUpdateParams,
    Device as IrecDevice,
    DeviceState
} from '@energyweb/issuer-irec-api-wrapper';
import {
    Device,
    DeviceModule,
    DeviceService,
    IrecDeviceService,
    UserIdentifier
} from '../src/device';

export enum TestUser {
    OrganizationAdmin = '0',
    OtherOrganizationAdmin = '1',
    PlatformAdmin = '2',
    SubmittedOrganizationAdmin = '3'
}

export const testUsers = new Map([
    [
        TestUser.OrganizationAdmin,
        {
            id: 1,
            organization: { id: 1000, status: OrganizationStatus.Active },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        } as IUser
    ],
    [
        TestUser.SubmittedOrganizationAdmin,
        {
            id: 1,
            organization: { id: 1000, status: OrganizationStatus.Submitted },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        } as IUser
    ],
    [
        TestUser.OtherOrganizationAdmin,
        {
            id: 2,
            organization: { id: 1001, status: OrganizationStatus.Active },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        } as IUser
    ],
    [
        TestUser.PlatformAdmin,
        {
            id: 3,
            organization: { id: 1002, status: OrganizationStatus.Active },
            status: UserStatus.Active,
            rights: Role.Admin
        } as IUser
    ]
]);

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = testUsers.get(req.headers['test-user']);
        return true;
    }
};

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
                entities: [Device, Connection, Registration],
                logging: ['info']
            }),
            DeviceModule
        ],
        providers: [DatabaseService]
    })
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .overrideProvider(IrecDeviceService)
        .useValue({
            createIrecDevice: async (
                user: ILoggedInUser,
                deviceData: DeviceCreateUpdateParams
            ): Promise<IrecDevice> => {
                return {
                    ...deviceData,
                    code: '100500',
                    status: DeviceState.InProgress
                };
            },
            update: async (
                user: UserIdentifier,
                code: string,
                device: Partial<IrecDevice>
            ): Promise<Partial<IrecDevice>> => {
                return { ...device, status: DeviceState.InProgress };
            }
        })
        .compile();

    const app = moduleFixture.createNestApplication();

    const deviceService = await app.resolve<DeviceService>(DeviceService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);

    app.useLogger(['log', 'error']);
    app.enableCors();

    useContainer(app.select(DeviceModule), { fallbackOnErrors: true });

    return {
        deviceService,
        databaseService,
        app
    };
};
