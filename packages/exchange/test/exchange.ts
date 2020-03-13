import { Contracts } from '@energyweb/issuer';
import { DeviceService, DeviceModule } from '@energyweb/origin-backend';
import {
    CanActivate,
    ExecutionContext,
    Logger,
    ValidationPipe,
    DynamicModule
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { ethers } from 'ethers';

import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { EmptyResultInterceptor } from '../src/empty-result.interceptor';
import { AccountService } from '../src/pods/account/account.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';

const web3 = 'http://localhost:8580';

// ganache account 2
const registryDeployer = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';

const deployRegistry = async () => {
    const { abi, bytecode } = Contracts.RegistryJSON;

    const provider = new ethers.providers.JsonRpcProvider(web3);
    const wallet = new ethers.Wallet(registryDeployer, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.deployed();
    await contract.functions.initialize();

    return contract;
};

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 1 };

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

const createDeviceModuleMock = (): DynamicModule => {
    const deviceServiceMock = { provide: DeviceService, useValue: {} as DeviceService };

    return {
        module: DeviceModule,
        providers: [deviceServiceMock],
        exports: [deviceServiceMock],
        global: true
    };
};

export const bootstrapTestInstance = async () => {
    const registry = await deployRegistry();

    const configService = new ConfigService({
        WEB3: web3,
        // ganache account 0
        EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
            '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
        // ganache account 1
        EXCHANGE_WALLET_PUB: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
        EXCHANGE_WALLET_PRIV: '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3',
        REGISTRY_ADDRESS: registry.address
    });

    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule, createDeviceModuleMock()],
        providers: [DatabaseService]
    })
        .overrideProvider(ConfigService)
        .useValue(configService)
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .compile();

    const app = moduleFixture.createNestApplication();

    const transferService = await app.resolve<TransferService>(TransferService);
    const accountService = await app.resolve<AccountService>(AccountService);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const demandService = await app.resolve<DemandService>(DemandService);
    const orderService = await app.resolve<OrderService>(OrderService);
    const productService = await app.resolve<ProductService>(ProductService);

    const appService = await app.resolve<AppService>(AppService);
    await appService.init(deviceTypes);

    app.useGlobalInterceptors(new EmptyResultInterceptor());
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(testLogger);

    return {
        transferService,
        accountService,
        databaseService,
        demandService,
        orderService,
        productService,
        registry,
        app
    };
};
