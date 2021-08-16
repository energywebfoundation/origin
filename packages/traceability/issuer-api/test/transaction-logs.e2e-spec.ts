/* eslint-disable no-unused-expressions */
import { IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { QueryBus } from '@nestjs/cqrs';
import moment from 'moment';
import request from 'supertest';

import { CertificateDTO } from '../src/pods/certificate/dto/certificate.dto';
import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';
import {
    bootstrapTestInstance,
    deviceManager,
    registryDeployer,
    TestUser,
    testUsers
} from './issuer-api';
import {
    CertificateWithLogs,
    GetCertificatesWithLogsQuery,
    GetCertificatesWithLogsResponse
} from '../src';
import { TRANSACTION_LOG_TABLE_NAME } from '../src/pods/certificate/transaction-log.entity';
import { BlockchainEventType } from '../src/pods/certificate/types';

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

describe('Transaction logs tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let queryBus: QueryBus;

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

    const expectLogs = (certificate: CertificateWithLogs) => {
        const logs = certificate.transactionLogs;
        expect(logs).to.have.length(4); /** @NOTE claim causes Transfer + Claim  */
        expect(logs[0].transactionType).to.be.eq(BlockchainEventType.IssuanceSingle);
        expect(logs[1].transactionType).to.be.eq(BlockchainEventType.TransferSingle);
        expect(logs[2].transactionType).to.be.eq(
            BlockchainEventType.TransferSingle
        ); /** @NOTE this is caused by Claim */
        expect(logs[3].transactionType).to.be.eq(BlockchainEventType.ClaimSingle);
    };

    const expectBatchLogs = (certificate: CertificateWithLogs) => {
        const logs = certificate.transactionLogs;
        expect(logs).to.have.length(4); /** @NOTE claim causes Transfer + Claim  */
        expect(logs[0].transactionType).to.be.eq(BlockchainEventType.IssuanceBatch);
        expect(logs[1].transactionType).to.be.eq(BlockchainEventType.TransferBatch);
        expect(logs[2].transactionType).to.be.eq(
            BlockchainEventType.TransferSingle
        ); /** @NOTE this is caused by Claim */
        expect(logs[3].transactionType).to.be.eq(BlockchainEventType.ClaimBatch);
    };

    before(async () => {
        ({ databaseService, app, queryBus } = await bootstrapTestInstance());

        await app.init();
    });

    afterEach(async () => {
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
        await databaseService.truncate(TRANSACTION_LOG_TABLE_NAME);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should create single issue, transfer and claim logs', async () => {
        const { id: certificateId } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificatesWithLogs: GetCertificatesWithLogsResponse = await queryBus.execute(
            new GetCertificatesWithLogsQuery({
                deviceIds: [certificateTestData.deviceId],
                from: new Date(0),
                to: new Date()
            })
        );

        expect(certificatesWithLogs).to.have.length(1);
        expect(certificatesWithLogs[0].id).to.be.eq(certificateId);
        expectLogs(certificatesWithLogs[0]);
    });

    it('should create batch issue, batch transfer and batch claim logs', async () => {
        const { body: ids } = await request(app.getHttpServer())
            .post(`/certificate-batch/issue`)
            .set({ 'test-user': TestUser.Issuer })
            .send([certificateTestData, certificateTestData])
            .expect(HttpStatus.CREATED);

        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/certificate-batch/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                certificateAmounts: [
                    { id: ids[0], amount: certificateTestData.energy },
                    { id: ids[1], amount: certificateTestData.energy }
                ],
                to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager)
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/certificate-batch/claim`)
            .set({ 'test-user': TestUser.OtherOrganizationDeviceManager })
            .send({
                claimData,
                certificateAmounts: [
                    { id: ids[0], amount: certificateTestData.energy },
                    { id: ids[1], amount: certificateTestData.energy }
                ]
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificatesWithLogs: GetCertificatesWithLogsResponse = await queryBus.execute(
            new GetCertificatesWithLogsQuery({
                deviceIds: [certificateTestData.deviceId],
                from: new Date(0),
                to: new Date()
            })
        );

        expect(certificatesWithLogs).to.have.length(2);
        expect(certificatesWithLogs[0].id).to.be.eq(ids[0]);
        expect(certificatesWithLogs[1].id).to.be.eq(ids[1]);

        expectBatchLogs(certificatesWithLogs[0]);
        expectBatchLogs(certificatesWithLogs[1]);
    });
});
