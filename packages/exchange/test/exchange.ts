/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contracts } from '@energyweb/issuer';
import { ConfigurationService, DeviceService, ExtendedBaseEntity } from '@energyweb/origin-backend';
import {
    IDeviceProductInfo,
    IDeviceWithRelationsIds,
    UserStatus
} from '@energyweb/origin-backend-core';
import { RolesGuard } from '@energyweb/origin-backend-utils';
import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { ethers } from 'ethers';
import { PriceStrategy } from '@energyweb/exchange-core';

import { entities } from '../src';
import { AppModule } from '../src/app.module';
import { AccountService } from '../src/pods/account/account.service';
import { BundleService } from '../src/pods/bundle/bundle.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';

const web3 = 'http://localhost:8580';

// ganache account 2
const registryDeployer = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';

const deployContract = async ({ abi, bytecode }: { abi: any; bytecode: string }) => {
    const provider = getProviderWithFallback(web3);
    const wallet = new ethers.Wallet(registryDeployer, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    return contract.deployed();
};

const deployRegistry = async () => {
    const contract = await deployContract(Contracts.RegistryJSON);

    return contract;
};

const deployIssuer = async (registry: string) => {
    const contract = await deployContract(Contracts.IssuerJSON);
    const wallet = new ethers.Wallet(registryDeployer);

    await contract['initialize(int256,address,address)'](100, registry, wallet.address);

    return contract;
};

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

export const bootstrapTestInstance = async (deviceServiceMock?: DeviceService) => {
    const registry = await deployRegistry();
    const issuer = await deployIssuer(registry.address);

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
        EXCHANGE_PRICE_STRATEGY: PriceStrategy.AskPrice
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
            AppModule
        ],
        providers: [
            DatabaseService,
            {
                provide: ConfigurationService,
                useValue: {
                    get: () => ({
                        deviceTypes,
                        contractsLookup: {
                            issuer: issuer.address,
                            registry: registry.address
                        }
                    })
                }
            },
            {
                provide: DeviceService,
                useValue:
                    deviceServiceMock ??
                    (({
                        findDeviceProductInfo: async (): Promise<IDeviceProductInfo> => {
                            return {
                                deviceType: 'Solar;Photovoltaic;Classic silicon',
                                country: 'Thailand',
                                region: 'Central',
                                province: 'Nakhon Pathom',
                                operationalSince: 2016,
                                gridOperator: 'TH-PEA'
                            };
                        },
                        findByExternalId: async (): Promise<
                            ExtendedBaseEntity & IDeviceWithRelationsIds
                        > => {
                            return {
                                deviceType: 'Solar;Photovoltaic;Classic silicon',
                                country: 'Thailand',
                                region: 'Central',
                                province: 'Nakhon Pathom',
                                operationalSince: 2016,
                                gridOperator: 'TH-PEA',
                                automaticPostForSale: false,
                                defaultAskPrice: null
                            } as ExtendedBaseEntity & IDeviceWithRelationsIds;
                        }
                    } as unknown) as DeviceService)
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
    const demandService = await app.resolve<DemandService>(DemandService);
    const orderService = await app.resolve<OrderService>(OrderService);
    const productService = await app.resolve<ProductService>(ProductService);
    const bundleService = await app.resolve<BundleService>(BundleService);

    app.useLogger(testLogger);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        transferService,
        accountService,
        databaseService,
        demandService,
        orderService,
        productService,
        bundleService,
        registry,
        issuer,
        app
    };
};
