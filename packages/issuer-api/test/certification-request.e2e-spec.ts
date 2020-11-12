/* eslint-disable no-unused-expressions */
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { Role } from '@energyweb/origin-backend-core';

import moment from 'moment';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { authenticatedUser, bootstrapTestInstance, deviceManager } from './issuer-api';
import { CERTIFICATION_REQUESTS_TABLE_NAME } from '../src/pods/certification-request/certification-request.entity';
import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificationRequestTestData = {
    to: deviceManager.address,
    energy: '1000000',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    deviceId: 'ABC-123',
    files: ['test.pdf', 'test2.pdf']
};

describe('Certification Request tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    before(async () => {
        ({ databaseService, app } = await bootstrapTestInstance());

        await app.init();

        await databaseService.truncate(CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    afterEach(async () => {
        await databaseService.truncate(CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should create a certification request + entry in the DB', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect(201)
            .expect((res) => {
                const {
                    deviceId,
                    fromTime,
                    toTime,
                    created,
                    requestId,
                    owner,
                    approved,
                    revoked,
                    files,
                    energy
                } = res.body;

                expect(deviceId).to.equal(certificationRequestTestData.deviceId);
                expect(fromTime).to.equal(certificationRequestTestData.fromTime);
                expect(toTime).to.equal(certificationRequestTestData.toTime);
                expect(created).to.be.above(1);
                expect(requestId).to.be.above(-1);
                expect(owner).to.equal(deviceManager.address);
                expect(approved).to.be.false;
                expect(revoked).to.be.false;
                expect(JSON.stringify(files)).to.equal(
                    JSON.stringify(certificationRequestTestData.files)
                );
                expect(energy).to.equal(certificationRequestTestData.energy);
            });

        await request(app.getHttpServer())
            .get(`/certification-request`)
            .expect(200)
            .expect((res) => {
                expect(res.body.length).to.equal(1);
            });
    });

    it('should not be able to request certification request twice for the same time period', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect(201);

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect(409);
    });

    it('should approve a certification request and a new certificate should be created', async () => {
        let certificationRequestId;
        let newCertificateTokenId;

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        authenticatedUser.rights = Role.Issuer;

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/approve`)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        authenticatedUser.rights = Role.OrganizationDeviceManager;

        await request(app.getHttpServer())
            .get(`/certification-request/${certificationRequestId}`)
            .expect(200)
            .expect((res) => {
                newCertificateTokenId = res.body.issuedCertificateTokenId;

                expect(newCertificateTokenId).to.be.above(-1);
            });

        await sleep(1000);

        await request(app.getHttpServer())
            .get(`/certificate/token-id/${newCertificateTokenId}`)
            .expect(200)
            .expect((res) => {
                const {
                    deviceId,
                    generationStartTime,
                    generationEndTime,
                    creationTime,
                    creationBlockHash,
                    tokenId,
                    isOwned
                } = res.body;

                expect(deviceId).to.equal(certificationRequestTestData.deviceId);
                expect(generationStartTime).to.equal(certificationRequestTestData.fromTime);
                expect(generationEndTime).to.equal(certificationRequestTestData.toTime);
                expect(creationTime).to.be.above(1);
                expect(creationBlockHash);
                expect(tokenId).to.be.above(-1);
                expect(isOwned).to.be.true;
            });
    });

    it('should revoke a certification request', async () => {
        let certificationRequestId;

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        authenticatedUser.rights = Role.Issuer;

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });
    });

    it('should fail to revoke a revoked certification request', async () => {
        let certificationRequestId;

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        authenticatedUser.rights = Role.Issuer;

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(400);
    });

    it('should create a private certification request', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.isPrivate).to.be.true;
            });
    });

    it('should approve a private certification request', async () => {
        let certificationRequestId;
        let newCertificateTokenId;

        await request(app.getHttpServer())
            .post('/certification-request')
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(201)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/approve`)
            .expect(200)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        await sleep(1000);

        await request(app.getHttpServer())
            .get(`/certification-request/${certificationRequestId}`)
            .expect(200)
            .expect((res) => {
                newCertificateTokenId = res.body.issuedCertificateTokenId;
            });

        await request(app.getHttpServer())
            .get(`/certificate/token-id/${newCertificateTokenId}`)
            .expect(200)
            .expect((res) => {
                const { issuedPrivately, latestCommitment } = res.body;

                expect(latestCommitment.commitment[deviceManager.address]).to.equal(
                    certificationRequestTestData.energy
                );
                expect(issuedPrivately).to.be.true;
            });
    });
});
