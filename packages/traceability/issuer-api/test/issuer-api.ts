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
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';

import { entities, IssuerModuleInputOptions } from '../src';
import { IssuerModule } from '../src/issuer.module';
import { BlockchainPropertiesService } from '../src/pods/blockchain/blockchain-properties.service';

process.env.OPERATOR_ENCRYPTION_KEY = 'randomstring';
const web3 = 'http://localhost:8581';
const provider = getProviderWithFallback(web3);

// ganache account 1
export const deviceManager = {
    address: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
    privateKey: '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3'
};
// ganache account 2
export const registryDeployer = {
    address: '0x9442ED348b161af888e6cB999951aE8b961F7B4B',
    privateKey: '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3'
};

// ganache account 2
export const otherDeviceManager = {
    address: '0xB00F0793d0ce69d7b07db16F92dC982cD6Bdf651',
    privateKey: '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e'
};

const deployRegistry = async () => {
    return Contracts.migrateRegistry(provider, registryDeployer.privateKey);
};

const deployIssuer = async (registry: string) => {
    return Contracts.migrateIssuer(provider, registryDeployer.privateKey, registry);
};

const deployPrivateIssuer = async (issuer: string) => {
    return Contracts.migratePrivateIssuer(provider, registryDeployer.privateKey, issuer);
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

export const bootstrapTestInstance = async (
    originalOptions: Partial<IssuerModuleInputOptions> = {}
) => {
    const registry = await deployRegistry();
    const issuer = await deployIssuer(registry.address);
    const privateIssuer = await deployPrivateIssuer(issuer.address);
    const issuerModule = IssuerModule.register(originalOptions);

    await issuer.setPrivateIssuer(privateIssuer.address);

    const configService = new ConfigService({
        BLOCKCHAIN_POLLING_INTERVAL: 100
    });

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
            issuerModule,
            StubValidateDeviceOwnershipQueryHandler
        ],
        providers: [DatabaseService]
    })
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .overrideProvider(ConfigService)
        .useValue(configService)
        .compile();

    const app = moduleFixture.createNestApplication();

    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const queryBus = await app.resolve<QueryBus>(QueryBus);

    const blockchainProperties = await blockchainPropertiesService.create(
        provider.network.chainId,
        registry.address,
        issuer.address,
        web3,
        registryDeployer.privateKey,
        null,
        privateIssuer.address
    );

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

    useContainer(app.select(issuerModule), { fallbackOnErrors: true });

    return {
        databaseService,
        registry,
        issuer,
        privateIssuer,
        provider,
        app,
        queryBus
    };
};
