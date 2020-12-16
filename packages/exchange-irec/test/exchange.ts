/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountService,
    AppModule,
    entities,
    IDeviceSettings,
    IExchangeConfigurationService,
    IExternalDeviceService,
    IProductInfo,
    OrderService,
    TransferService
} from '@energyweb/exchange';
import { UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService, RolesGuard } from '@energyweb/origin-backend-utils';
import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';

import { AppModule as ExchangeIRECModule } from '../src/app.module';

import { ProductDTO } from '../src/product';

const web3 = 'http://localhost:8580';

export const authenticatedUser = { id: 1, organization: { id: '1000' }, status: UserStatus.Active };

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = authenticatedUser;

        return true;
    }
};

const testLogger = new Logger('e2e');

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

export const bootstrapTestInstance = async (deviceServiceMock?: IExternalDeviceService) => {
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
                port: Number(process.env.DB_PORT) ?? 5432,
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info']
            }),
            ConfigModule,
            AppModule,
            ExchangeIRECModule
        ],
        providers: [
            DatabaseService,
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
                    }),
                    getDeviceSettings: async (): Promise<IDeviceSettings> => ({
                        postForSale: false,
                        postForSalePrice: null
                    })
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
        .compile();

    const app = moduleFixture.createNestApplication();

    const transferService = await app.resolve<TransferService>(TransferService);
    const accountService = await app.resolve<AccountService>(AccountService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const orderService = await app.resolve<OrderService<ProductDTO>>(OrderService);

    app.useLogger(testLogger);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        transferService,
        accountService,
        databaseService,
        orderService,
        app
    };
};
