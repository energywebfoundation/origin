import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { InfluxDB } from 'influx';
import { AuthGuard } from '@nestjs/passport';

import { MeasurementDTO, ReadDTO, ReadsService, Unit } from '@energyweb/energy-api-influxdb';
import { Aggregate } from '@energyweb/energy-api-influxdb/dist/reads/aggregate.enum';
import { request, authGuard } from './request';
import { ReadsController } from '../src/reads/reads.controller';

describe('ReadsController (e2e)', () => {
    let app: INestApplication;

    const INFLUXDB_URL = 'http://localhost:8086';
    const INFLUXDB_TOKEN = 'admin:admin';
    const INFLUXDB_ORG = 'org';
    const INFLUXDB_BUCKET = 'energy/autogen';

    const configService = new ConfigService({
        INFLUXDB_URL,
        INFLUXDB_TOKEN,
        INFLUXDB_ORG,
        INFLUXDB_BUCKET
    });

    before(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule],
            controllers: [ReadsController],
            providers: [ReadsService]
        })
            .overrideProvider(ConfigService)
            .useValue(configService)
            .overrideGuard(AuthGuard('default'))
            .useValue(authGuard)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const measurement = new MeasurementDTO();
        measurement.unit = Unit.kWh;
        measurement.reads = [
            { timestamp: new Date('2020-01-01'), value: 1500 },
            { timestamp: new Date('2020-01-02'), value: 1700 },
            { timestamp: new Date('2020-02-01'), value: 2000 },
            { timestamp: new Date('2020-02-02'), value: 2500 }
        ];

        await request(app).post('/meter-reads/M1').send(measurement).expect(HttpStatus.CREATED);
    });

    after(async () => {
        try {
            const client = new InfluxDB({
                host: 'localhost',
                username: 'admin',
                password: 'admin',
                database: 'energy'
            });

            await client.query(`DROP SERIES FROM "read"`);
        } catch (e) {}
    });

    it('should read time-series data using range', async () => {
        await request(app)
            .get('/meter-reads/M1')
            .query({
                start: new Date('2020-01-01').toISOString(),
                end: new Date('2020-01-02').toISOString()
            })
            .expect(200)
            .expect((res) => {
                const reads = res.body as ReadDTO[];

                expect(reads).to.have.length(2);
            });
    });

    it('should return reads difference using range', async () => {
        await request(app)
            .get('/meter-reads/M1/difference')
            .query({
                start: new Date('2020-01-01').toISOString(),
                end: new Date('2020-01-02').toISOString()
            })
            .expect(200)
            .expect((res) => {
                const reads = res.body as ReadDTO[];

                expect(reads).to.have.length(1);
                expect(reads[0].value).to.equal((1700 - 1500) * 10 ** 3);
            });
    });

    it('should return aggregated monthly sum', async () => {
        await request(app)
            .get('/meter-reads/M1/aggregate')
            .query({
                start: new Date('2020-01-01').toISOString(),
                end: new Date('2020-03-01').toISOString(),
                window: '1mo',
                aggregate: Aggregate.Sum
            })
            .expect(200)
            .expect((res) => {
                const reads = res.body as ReadDTO[];

                expect(reads).to.have.length(2);
                expect(reads[0].value).to.equal((1700 - 1500) * 10 ** 3);
                expect(reads[1].value).to.equal((2500 - 1700) * 10 ** 3);
            });
    });

    it('should return aggregated annual sum', async () => {
        await request(app)
            .get('/meter-reads/M1/aggregate')
            .query({
                start: new Date('2020-01-01').toISOString(),
                end: new Date('2020-03-01').toISOString(),
                window: '1y',
                aggregate: Aggregate.Sum
            })
            .expect(200)
            .expect((res) => {
                const reads = res.body as ReadDTO[];

                expect(reads).to.have.length(1);
                expect(reads[0].value).to.equal((2500 - 1500) * 10 ** 3);
            });
    });
});
