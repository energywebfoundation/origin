/* eslint-disable no-unused-expressions */
import { IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { BigNumber, constants } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { CertificateDTO } from '../src/pods/certificate/dto/certificate.dto';
import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';
import {
    bootstrapTestInstance,
    deviceManager,
    otherDeviceManager,
    registryDeployer,
    TestUser,
    testUsers
} from './issuer-api';
import { ClaimDTO } from '../src';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '1000000'
};

const claimData: IClaimData = {
    beneficiary: '1234',
    location: 'Random address 123, Somewhere',
    countryCode: 'DE',
    periodStartDate: moment('2020-01-01').toISOString(),
    periodEndDate: moment('2020-02-01').toISOString(),
    purpose: 'Some random purpose'
};

const getUserBlockchainAddress = (user: TestUser) =>
    testUsers.get(user).organization.blockchainAccountAddress;

describe.skip('Certificate tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    const createCertificate = async (toUser?: TestUser): Promise<CertificateDTO> => {
        const { body } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                to: toUser ? getUserBlockchainAddress(toUser) : certificateTestData.to
            })
            .expect(HttpStatus.CREATED);

        return body;
    };

    const getCertificates = async (user: TestUser): Promise<CertificateDTO[]> => {
        const { body } = await request(app.getHttpServer())
            .get(`/certificate`)
            .set({ 'test-user': user })
            .expect(HttpStatus.OK);

        return body;
    };

    const getCertificate = async (
        id: CertificateDTO['id'],
        user: TestUser
    ): Promise<CertificateDTO> => {
        const { body } = await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': user })
            .expect(HttpStatus.OK);

        return body;
    };

    before(async () => {
        ({ databaseService, app } = await bootstrapTestInstance());

        await app.init();
    });

    afterEach(async () => {
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    after(async () => {
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);

        await databaseService.cleanUp();
        await app.close();
    });

});
