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
        ganache.server().listen(8545);

        const testLogger = new Logger('e2e');

        const configService = new ConfigService({
            WEB3: 'http://localhost:8545',
            JWT_SECRET: '123',
            EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
                '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
            EXCHANGE_WALLET_PUB: '0xD173313A51f8fc37BcF67569b463abd89d81844f',
            EXCHANGE_WALLET_PRIV:
                '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
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
