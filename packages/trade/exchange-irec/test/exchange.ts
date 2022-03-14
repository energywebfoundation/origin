/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountService,
    AppModule,
    entities as ExchangeEntities,
    IExchangeConfigurationService,
    IExternalDeviceService,
    IExternalUserService,
    IProductInfo,
    OrderService,
    TransferService
} from '@energyweb/exchange';
import { CertificateUtils, Contracts } from '@energyweb/issuer';
import { BlockchainPropertiesService, IrecCertificationRequest } from '@energyweb/issuer-irec-api';
import { IUser, OrganizationStatus, Role, UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService, RolesGuard } from '@energyweb/origin-backend-utils';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { ClaimRequestedEvent } from '@energyweb/exchange';
import { entities as ExchangeIRECEntities, usedEntities } from '../src';

import { AppModule as ExchangeIRECModule } from '../src/app.module';

import { ProductDTO } from '../src';
import { UserService } from '@energyweb/origin-backend';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { DeviceRegistryService } from '@energyweb/origin-device-registry-api';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';

const web3 = 'http://localhost:8545';
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
    OtherOrganizationDeviceManager = '4',
    PlatformAdmin = '5'
}

export const testUsers = new Map([
    [
        TestUser.OrganizationDeviceManager,
        {
            id: Number(TestUser.OrganizationDeviceManager),
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
            id: Number(TestUser.UserWithoutBlockchainAccount),
            organization: { id: 1001, status: OrganizationStatus.Active },
            status: UserStatus.Active,
            rights: Role.OrganizationAdmin
        } as IUser
    ],
    [
        TestUser.Issuer,
        {
            id: Number(TestUser.Issuer),
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
            id: Number(TestUser.OtherOrganizationDeviceManager),
            organization: {
                id: 1000,
                status: OrganizationStatus.Active,
                blockchainAccountAddress: otherDeviceManager.address
            },
            status: UserStatus.Active,
            rights: Role.OrganizationDeviceManager
        } as IUser
    ],
    [
        TestUser.PlatformAdmin,
        {
            id: 5,
            organization: { id: 1002 },
            status: UserStatus.Active,
            rights: Role.Admin
        } as IUser
    ]
]);

export const authenticatedUser = testUsers.get(TestUser.OrganizationDeviceManager);

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = testUsers.get(req.headers['test-user']);
        return true;
    }
};

const deviceTypes = [
    ['Solar'],
    ['Solar', 'Photovoltaic'],
    ['Solar', 'Photovoltaic', 'Roof mounted'],
    ['Solar', 'Photovoltaic', 'Ground mounted'],
    ['Solar', 'Photovoltaic', 'Classic silicon'],
    ['Solar', 'Concentration'],
    ['Wind'],
    ['Wind', 'Onshore'],
    ['Wind', 'Offshore'],
    ['Marine'],
    ['Marine', 'Tidal'],
    ['Marine', 'Tidal', 'Inshore'],
    ['Marine', 'Tidal', 'Offshore']
];

@EventsHandler(ClaimRequestedEvent)
export class ClaimRequestedHandler implements IEventHandler<ClaimRequestedEvent> {
    public handledEvents: ClaimRequestedEvent[] = [];

    public async handle(event: ClaimRequestedEvent) {
        this.handledEvents.push(event);
    }
}

export const bootstrapTestInstance = async (
    deviceServiceMock?: IExternalDeviceService,
    userServiceMock?: IExternalUserService
) => {
    const registry = await deployRegistry();
    const issuer = await deployIssuer(registry.address);
    const privateIssuer = await deployPrivateIssuer(issuer.address);

    await issuer.setPrivateIssuer(privateIssuer.address);

    const configService = new ConfigService({
        WEB3: web3,
        // ganache account 0
        EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
            '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
        // ganache account 1
        EXCHANGE_WALLET_PUB: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
        EXCHANGE_WALLET_PRIV: '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3',
        ISSUER_ID: 'Issuer ID',
        ENERGY_PER_UNIT: 1000000,
        EXCHANGE_PRICE_STRATEGY: 0
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
                entities: [
                    ...ExchangeEntities,
                    ...ExchangeIRECEntities,
                    ...usedEntities,
                    IrecCertificationRequest
                ],
                logging: ['info']
            }),
            ConfigModule,
            AppModule,
            ExchangeIRECModule
        ],
        providers: [
            DatabaseService,
            ClaimRequestedHandler,
            {
                provide: IExchangeConfigurationService,
                useValue: {
                    getRegistryAddress: async () => '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
                    getIssuerAddress: async () => '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
                    getDeviceTypes: async () => deviceTypes,
                    getGridOperators: async () => ['TH-PEA', 'TH-MEA']
                }
            },
            {
                provide: IExternalDeviceService,
                useValue: deviceServiceMock ?? {
                    getDeviceProductInfo: async (): Promise<IProductInfo> => ({
                        deviceType: 'Solar;Photovoltaic;Classic silicon',
                        country: 'Thailand',
                        region: 'Central',
                        province: 'Nakhon Pathom',
                        operationalSince: 2016,
                        gridOperator: 'TH-PEA'
                    })
                }
            },
            {
                provide: IExternalUserService,
                useValue: userServiceMock ?? {
                    getPlatformAdmin: async (): Promise<IUser> =>
                        ({
                            organization: {
                                id: 1
                            }
                        } as IUser)
                }
            }
        ]
    })
        .overrideProvider(ConfigService)
        .useValue(configService)
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .overrideGuard(RolesGuard)
        .useValue(authGuard)
        .overrideProvider(UserService)
        .useValue({
            getPlatformAdmin() {
                return testUsers.get(TestUser.PlatformAdmin);
            },
            findOne(userId: TestUser) {
                return testUsers.get(userId);
            }
        })
        .overrideProvider(DeviceService)
        .useValue({
            findOne: () => ({ fuelType: '', status: 'Approved' }),
            findAll: (): object[] => [
                {
                    id: 1,
                    ownerId: 1000,
                    address: '1 Wind Farm Avenue, London',
                    capacity: 500,
                    commissioningDate: new Date('2001-08-10'),
                    countryCode: 'GB',
                    defaultAccount: 'someTradeAccount',
                    deviceType: 'TC110',
                    fuelType: 'ES200',
                    issuer: 'someIssuerCode',
                    latitude: '53.405088',
                    longitude: '-1.744222',
                    name: 'DeviceXYZ',
                    notes: 'Lorem ipsum dolor sit amet',
                    registrantOrganization: 'someRegistrantCode',
                    registrationDate: new Date('2001-09-20'),
                    status: 'Approved',
                    code: 'mockDeviceCode',
                    active: true
                }
            ]
        })
        .overrideProvider(DeviceRegistryService)
        .useValue({
            find: () => [{ id: 1, externalRegistryId: 1 }]
        })
        .compile();

    const app = moduleFixture.createNestApplication();

    const transferService = await app.resolve<TransferService>(TransferService);
    const accountService = await app.resolve<AccountService>(AccountService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const orderService = await app.resolve<OrderService<ProductDTO>>(OrderService);
    const queryBus = await app.resolve<QueryBus>(QueryBus);
    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );
    const claimRequestedHandler = await app.resolve<ClaimRequestedHandler>(ClaimRequestedHandler);

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

    app.useLogger(['log']);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        transferService,
        accountService,
        databaseService,
        orderService,
        claimRequestedHandler,
        queryBus,
        app
    };
};
