/* eslint-disable import/no-extraneous-dependencies */
import { AppModule as ExchangeModule } from '@energyweb/exchange';
import { Contracts } from '@energyweb/issuer';
import { BlockchainPropertiesService } from '@energyweb/issuer-api';
import { ConfigurationService } from '@energyweb/origin-backend';
import { IUser, OrganizationStatus, Role, UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import ganache from 'ganache-core';

import { OriginAppModule } from '../src';

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
            organization: { id: 1000, status: OrganizationStatus.Active },
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

const PORT = 9000;
const rpcUrl = `http://localhost:${PORT}`;
const privateKey = '0xdc8e1fc5a23a837105f11ca050f06bc5a88a2ad54fb49bc580232c8c82e8ff99';

export const config: Record<string, string | number> = {
    WEB3: rpcUrl,
    JWT_SECRET: '123',
    EXCHANGE_ACCOUNT_DEPLOYER_PRIV: privateKey,
    EXCHANGE_WALLET_PRIV: privateKey,
    EXCHANGE_PRICE_STRATEGY: 0,
    ENERGY_PER_UNIT: 1000000,
    ISSUER_ID: 'ISSUER',
    DEPLOY_KEY: privateKey
};

export const bootstrapTestInstance = async () => {
    ganache.provider();
    const rpc = ganache.server({
        accounts: [
            {
                secretKey: privateKey,
                balance: `0x${(100 * 10 ** 18).toString(16)}`
            }
        ]
    });

    rpc.listen(PORT);

    const provider = getProviderWithFallback(rpcUrl);
    const registry = await Contracts.migrateRegistry(provider, privateKey);
    const issuer = await Contracts.migrateIssuer(provider, privateKey, registry.address);

    const authGuard: CanActivate = {
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = testUsers.get(req.headers['test-user']);
            return true;
        }
    };

    const moduleFixture = await Test.createTestingModule({
        imports: [OriginAppModule.register(null)],
        providers: [DatabaseService]
    })
        .overrideProvider(ConfigService)
        .useValue({
            get: (path: string, defaultValue?: string) => config[path] ?? defaultValue
        })
        .overrideProvider(ConfigurationService)
        .useValue({
            get: () => ({
                deviceTypes: [['Solar']]
            })
        })
        .overrideProvider(BlockchainPropertiesService)
        .useValue({
            get: () => ({
                netId: provider.network.chainId,
                registry: registry.address,
                issuer: issuer.address,
                rpcNode: rpcUrl,
                platformOperatorPrivateKey: privateKey,
                wrap: (): any => ({
                    web3: provider,
                    registry,
                    issuer
                })
            })
        })
        .overrideGuard(AuthGuard('default'))
        .useValue(authGuard)
        .compile();

    const app = moduleFixture.createNestApplication();

    useContainer(app.select(ExchangeModule), { fallbackOnErrors: true });

    const databaseService = await app.resolve<DatabaseService>(DatabaseService);

    app.enableShutdownHooks();
    app.useLogger(['log', 'error']);

    return { app, rpc, databaseService };
};
