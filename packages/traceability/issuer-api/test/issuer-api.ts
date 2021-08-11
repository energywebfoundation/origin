/* eslint-disable @typescript-eslint/no-explicit-any */
import { CertificateUtils, Contracts } from '@energyweb/issuer';
import {
    IUser,
    OrganizationStatus,
    Role,
    UserStatus,
    ValidateDeviceOwnershipQuery
} from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import { BlockchainPropertiesService } from '../src/pods/blockchain/blockchain-properties.service';

const web3 = 'http://localhost:8581';
const provider = getProviderWithFallback(web3);

// ganache account 1
export const deviceManager = {
    address: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
    privateKey: '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3'
};
// ganache account 0
export const registryDeployer = {
    address: '0xD173313A51f8fc37BcF67569b463abd89d81844f',
    privateKey: '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
};

// ganache account 2
export const otherDeviceManager = {
    address: '0xB00F0793d0ce69d7b07db16F92dC982cD6Bdf651',
    privateKey: '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e'
};

export enum TestUser {
    UserWithoutBlockchainAccount = '1',
    OrganizationDeviceManager = '2',
    Issuer = '3',
    OtherOrganizationDeviceManager = '4'
}

export const testUsers = new Map([
    [
        TestUser.OrganizationDeviceManager,
        {
            id: 1,
            organization: {
                id: 1000,
                status: OrganizationStatus.Active,
                blockchainAccountAddress: deviceManager.address
            },
            status: UserStatus.Active,
            rights: Role.OrganizationDeviceManager
        } as IUser
    ],
    [
        TestUser.UserWithoutBlockchainAccount,
        {
            id: 2,
            organization: { id: 1001, status: OrganizationStatus.Active },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        } as IUser
    ],
    [
        TestUser.Issuer,
        {
            id: 3,
            organization: {
                id: 1003,
                status: OrganizationStatus.Active,
                blockchainAccountAddress: registryDeployer.address
            },
            status: UserStatus.Active,
            rights: Role.Issuer
        } as IUser
    ],
    [
        TestUser.OtherOrganizationDeviceManager,
        {
            id: 1,
            organization: {
                id: 1000,
                status: OrganizationStatus.Active,
                blockchainAccountAddress: otherDeviceManager.address
            },
            status: UserStatus.Active,
            rights: Role.OrganizationDeviceManager
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

@QueryHandler(ValidateDeviceOwnershipQuery)
export class StubValidateDeviceOwnershipQueryHandler
    implements IQueryHandler<ValidateDeviceOwnershipQuery>
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async execute(query: ValidateDeviceOwnershipQuery): Promise<boolean> {
        return true;
    }
}

export const bootstrapTestInstance: any = async (handler: Type<any>) => {
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
                logging: ['info'],
                keepConnectionAlive: true
            }),
            AppModule,
            handler ?? StubValidateDeviceOwnershipQueryHandler
        ],
        providers: [DatabaseService]
    })
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .compile();

    const app = moduleFixture.createNestApplication();

    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);

    const blockchainProperties = await blockchainPropertiesService.get();

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        blockchainProperties.wrap(deviceManager.privateKey)
    );

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        blockchainProperties.wrap(otherDeviceManager.privateKey)
    );

    app.useLogger(['log', 'error']);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        databaseService,
        provider,
        app
    };
};
