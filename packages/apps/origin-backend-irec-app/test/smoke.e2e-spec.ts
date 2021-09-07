/* eslint-disable import/no-extraneous-dependencies */
import { ConfigurationService } from '@energyweb/origin-backend';
import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import ganache from 'ganache-core';

import { BlockchainPropertiesService } from '@energyweb/issuer-irec-api';
import { Contracts } from '@energyweb/issuer';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { OriginAppModule } from '../src/origin-app.module';

describe('Origin Backend App', () => {
    it('should run origin app', async () => {
        const privateKey = '0xdc8e1fc5a23a837105f11ca050f06bc5a88a2ad54fb49bc580232c8c82e8ff99';

        const PORT = 9010;

        ganache.provider();
        ganache
            .server({
                accounts: [
                    {
                        secretKey: privateKey,
                        balance: `0x${(100 * 10 ** 18).toString(16)}`
                    }
                ]
            })
            .listen(PORT);

        const rpcUrl = `http://localhost:${PORT}`;
        const provider = getProviderWithFallback(rpcUrl);
        const registry = await Contracts.migrateRegistry(provider, privateKey);
        const issuer = await Contracts.migrateIssuer(provider, privateKey, registry.address);

        const config: Record<string, string | number> = {
            WEB3: rpcUrl,
            JWT_SECRET: '123',
            EXCHANGE_ACCOUNT_DEPLOYER_PRIV: privateKey,
            EXCHANGE_WALLET_PRIV: privateKey,
            EXCHANGE_PRICE_STRATEGY: 0,
            INFLUXDB_URL: 'http://localhost:8086',
            INFLUXDB_TOKEN: 'admin:admin',
            INFLUXDB_ORG: 'org',
            INFLUXDB_BUCKET: 'energy/autogen'
        };

        const moduleFixture = await Test.createTestingModule({
            imports: [OriginAppModule]
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
            .compile();

        const app = moduleFixture.createNestApplication();
        app.enableShutdownHooks();
        app.useLogger(new Logger('e2e'));

        await app.init();

        await request(app.getHttpServer()).get(`/configuration`).expect(HttpStatus.OK);

        await app.close();
    });
});
