/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contracts, CertificateUtils } from '@energyweb/issuer';
import { Role, UserStatus } from '@energyweb/origin-backend-core';
import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { DatabaseService } from '@energyweb/origin-backend-utils';

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
// ganache account 2
export const registryDeployer = {
    address: '0x9442ED348b161af888e6cB999951aE8b961F7B4B',
    privateKey: '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3'
};

const deployRegistry = async () => {
    return Contracts.migrateRegistry(provider, registryDeployer.privateKey);
};

const deployIssuer = async (registry: string) => {
    return Contracts.migrateIssuer(provider, registryDeployer.privateKey, registry);
};

export const authenticatedUser = {
    id: 1,
    rights: Role.OrganizationDeviceManager,
    organization: { id: '1000' },
    blockchainAccountAddress: deviceManager.address,
    status: UserStatus.Active
};

const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = authenticatedUser;

        return true;
    }
};

const testLogger = new Logger('e2e');

export const bootstrapTestInstance: any = async () => {
    const registry = await deployRegistry();
    const issuer = await deployIssuer(registry.address);

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
                logging: ['info'],
                keepConnectionAlive: true
            }),
            AppModule
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

    const blockchainProperties = await blockchainPropertiesService.create(
        provider.network.chainId,
        registry.address,
        issuer.address,
        web3,
        registryDeployer.privateKey
    );

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        blockchainProperties.wrap(deviceManager.privateKey)
    );

    app.useLogger(testLogger);
    app.enableCors();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    return {
        databaseService,
        registry,
        issuer,
        provider,
        app
    };
};
