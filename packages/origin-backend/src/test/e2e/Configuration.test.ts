import 'mocha';

import { IOriginConfiguration } from '@energyweb/origin-backend-core';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { assert } from 'chai';
import request from 'supertest';

import { AppModule } from '../../app.module';

describe('Configuration API tests', () => {
    let app: INestApplication;

    const standard = 'I-REC';
    const country = {
        name: 'Test Country',
        regions: {
            'North East': ['Random NE Region']
        }
    };
    const currency = 'USD';
    const currency2 = 'EUR';

    before(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        app.enableCors();

        await app.init();
    });

    describe('Configuration', () => {
        it('fails with a 404 when configuration not set', async () => {
            await request(app.getHttpServer())
                .get('/Configuration')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('updates the configuration', async () => {
            const configuration: IOriginConfiguration = {
                currencies: [currency, currency2],
                countryName: country.name,
                regions: country.regions,
                complianceStandard: standard
            };

            await request(app.getHttpServer())
                .put('/Configuration')
                .send(configuration)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK);

            await request(app.getHttpServer())
                .get('/Configuration')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(HttpStatus.OK)
                .expect((res) => {
                    assert.deepOwnInclude(res.body, configuration);
                });
        });
    });

    after(async () => {
        await app.close();
    });
});
