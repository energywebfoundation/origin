/* eslint-disable import/no-extraneous-dependencies */
import { CERTIFICATES_TABLE_NAME } from '@energyweb/issuer-api/dist/js/src/pods/certificate/certificate.entity';
import { CERTIFICATION_REQUESTS_TABLE_NAME } from '@energyweb/issuer-api/dist/js/src/pods/certification-request/certification-request.entity';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BigNumber } from 'ethers';
import Ganache from 'ganache-core';
import moment from 'moment';
import supertest from 'supertest';

import { bootstrapTestInstance, config, TestUser } from './origin';
import { request } from './request';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Issuer', () => {
    let app: INestApplication;
    let rpc: Ganache.Server;
    let databaseService: DatabaseService;
    let test: supertest.SuperTest<supertest.Test>;

    before(async () => {
        ({ app, rpc, databaseService } = await bootstrapTestInstance());

        await app.init();

        test = request(app);
    });

    beforeEach(async () => {
        await databaseService.truncate('device');
    });

    after(async () => {
        await databaseService.truncate(CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);

        await app.close();
        rpc.close();
    });

    it('should reject request for issuance from the non-owner of the device', async () => {
        const externalDeviceId = 'ID';

        const device = {
            address: '',
            capacityInW: 1000,
            complianceRegistry: 'I-REC',
            country: 'EU',
            description: '',
            deviceType: 'Solar',
            facilityName: 'Test',
            gpsLatitude: '10',
            gpsLongitude: '10',
            gridOperator: 'OP',
            images: '',
            operationalSince: 2000,
            otherGreenAttributes: '',
            province: '',
            region: '',
            status: DeviceStatus.Active,
            timezone: '',
            typeOfPublicSupport: '',
            deviceGroup: '',
            smartMeterReads: [
                { timestamp: 10000, meterReading: BigNumber.from(100) },
                { timestamp: 11000, meterReading: BigNumber.from(200) },
                { timestamp: 12000, meterReading: BigNumber.from(300) }
            ],
            externalDeviceIds: [{ id: externalDeviceId, type: config.ISSUER_ID }]
        };

        await test
            .post('/device')
            .send(device)
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .expect(HttpStatus.CREATED);

        const certificationRequestTestData = {
            to: '0x47A60575B83A7Cf1f59a8B1e6B8030A85EAfB36e',
            energy: '1000000',
            fromTime: moment().subtract(2, 'month').unix(),
            toTime: moment().subtract(1, 'month').unix(),
            deviceId: externalDeviceId,
            files: ['test.pdf', 'test2.pdf']
        };

        await test
            .post('/certification-request')
            .set({ 'test-user': TestUser.OtherOrganizationAdmin })
            .send(certificationRequestTestData)
            .expect(HttpStatus.FORBIDDEN);

        await test
            .post('/certification-request')
            .set({ 'test-user': TestUser.OrganizationAdmin })
            .send(certificationRequestTestData)
            .expect(HttpStatus.CREATED);

        await sleep(500);
    });
});
