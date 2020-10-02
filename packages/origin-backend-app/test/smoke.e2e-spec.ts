/* eslint-disable import/no-extraneous-dependencies */
import { ConfigurationService } from '@energyweb/origin-backend';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import ganache from 'ganache-core';

import { OriginAppModule } from '../src';

describe('Origin Backend App', () => {
    it('should run origin app', async () => {
        const privateKey = '0xdc8e1fc5a23a837105f11ca050f06bc5a88a2ad54fb49bc580232c8c82e8ff99';

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
            .listen(9000);

        const testLogger = new Logger('e2e');

        const configService = new ConfigService({
            WEB3: 'http://localhost:9000',
            JWT_SECRET: '123',
            EXCHANGE_ACCOUNT_DEPLOYER_PRIV: privateKey,
            EXCHANGE_WALLET_PRIV: privateKey,
            EXCHANGE_PRICE_STRATEGY: 0
        });

        const moduleFixture = await Test.createTestingModule({
            imports: [OriginAppModule.register(null)]
        })
            .overrideProvider(ConfigService)
            .useValue(configService)
            .overrideProvider(ConfigurationService)
            .useValue({
                get: () => ({
                    deviceTypes: [['Solar']],
                    contractsLookup: {
                        issuer: '',
                        registry: ''
                    }
                })
            })
            .compile();

        const app = moduleFixture.createNestApplication();
        app.useLogger(testLogger);

        await app.init();

        await request(app.getHttpServer()).get(`/configuration`).expect(200);

        await app.close();
    });
});
