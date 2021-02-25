import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { expect } from 'chai';

import { CreateSupplyDto, DB_TABLE_PREFIX, Supply } from '../src';
import { bootstrapTestInstance } from './exchange';

describe('Supply API', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    beforeEach(async () => {
        await databaseService.truncate(`${DB_TABLE_PREFIX}_supply`);
    });

    before(async () => {
        ({ app, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const supply: CreateSupplyDto = {
        active: true,
        deviceId: 'TEST',
        price: 100
    };

    it('should allow to create supply settings for device', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/supply')
            .send(supply)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .get(`/supply/${id}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const result = res.body as Supply;

                expect(result.id).to.equal(id);
            });
    });

    it('should not allow to create supply settings for device twice', async () => {
        await request(app.getHttpServer()).post('/supply').send(supply).expect(HttpStatus.CREATED);

        await request(app.getHttpServer()).post('/supply').send(supply).expect(HttpStatus.CONFLICT);
    });

    it('should allow to update supply settings for device', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/supply')
            .send({ ...supply, active: false })
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .put(`/supply/${id}`)
            .send({ active: true, price: 200 })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const result = res.body as Supply;

                expect(result.id).to.equal(id);
                expect(result.price).to.equal(200);
                expect(result.active).to.equal(true);
            });
    });
});
