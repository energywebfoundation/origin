/* eslint-disable no-unused-expressions */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { Role } from '@energyweb/origin-backend-core';
import { getAddress } from 'ethers/lib/utils';

import moment from 'moment';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { authenticatedUser, bootstrapTestInstance, deviceManager } from './issuer-api';
import { CERTIFICATION_REQUESTS_TABLE_NAME } from '../src/pods/certification-request/certification-request.entity';
import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';
import { CertificationRequestStatus } from '../src/pods/certification-request/certification-request-status.enum';

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

    it('should return 400 BadRequest if "to" address is invalid', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send({ ...certificationRequestTestData, to: 'invalid one' })
            .expect(HttpStatus.BAD_REQUEST);
    });

    [
        certificationRequestTestData,
        { ...certificationRequestTestData, to: '0x0089d53f703f7e0843953d48133f74ce247184c2' },
        { ...certificationRequestTestData, to: '0x7CB57B5A97EABE94205C07890BE4C1AD31E486A8' }
    ].forEach((certReqData) => {
        it(`should create a certification request + entry in the DB: ${certReqData.to}`, async () => {
            const {
                body: {
                    deviceId,
                    fromTime,
                    toTime,
                    created,
                    requestId,
                    owner,
                    approved,
                    revoked,
                    files,
                    energy,
                    status
                }
            } = await request(app.getHttpServer())
                .post('/certification-request')
                .send(certReqData)
                .expect(HttpStatus.CREATED);

            expect(deviceId).to.equal(certReqData.deviceId);
            expect(fromTime).to.equal(certReqData.fromTime);
            expect(toTime).to.equal(certReqData.toTime);
            expect(created).to.be.null;
            expect(requestId).to.be.null;
            expect(owner).to.equal(getAddress(certReqData.to));
            expect(approved).to.be.false;
            expect(revoked).to.be.false;
            expect(status).to.be.equal(CertificationRequestStatus.Queued);
            expect(JSON.stringify(files)).to.equal(JSON.stringify(certReqData.files));
            expect(energy).to.equal(certReqData.energy);

            const { body: requests } = await request(app.getHttpServer())
                .get(`/certification-request`)
                .expect(HttpStatus.OK);

            const cr: any = requests.find((req: any) => req.owner === getAddress(certReqData.to));
            expect(cr).to.be.not.empty;
        });
    });

    it('should not be able to request certification request twice for the same time period', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect(HttpStatus.CONFLICT);
    });

    it('should approve a certification request and a new certificate should be created', async () => {
        const {
            body: { id: certificationRequestId }
        } = await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData);

        // need to wait for item to be picked up from the queue and deployed
        await sleep(3000);

        authenticatedUser.rights = Role.Issuer;

        const {
            body: { success }
        } = await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/approve`)
            .expect(HttpStatus.OK);

        expect(success).to.be.true;

        authenticatedUser.rights = Role.OrganizationDeviceManager;
        authenticatedUser.blockchainAccountAddress = deviceManager.address;

        const {
            body: { issuedCertificateTokenId: newCertificateTokenId }
        } = await request(app.getHttpServer())
            .get(`/certification-request/${certificationRequestId}`)
            .expect(HttpStatus.OK);

        expect(newCertificateTokenId).to.be.above(-1);

        await sleep(1000);

        const { body: certificate } = await request(app.getHttpServer())
            .get(`/certificate/token-id/${newCertificateTokenId}`)
            .expect(HttpStatus.OK);

        expect(certificate.deviceId).to.equal(certificationRequestTestData.deviceId);
        expect(certificate.generationStartTime).to.equal(certificationRequestTestData.fromTime);
        expect(certificate.generationEndTime).to.equal(certificationRequestTestData.toTime);
        expect(certificate.creationTime).to.be.above(1);
        expect(certificate.creationBlockHash);
        expect(certificate.tokenId).to.be.above(-1);
        expect(certificate.issuedPrivately).to.be.false;
        expect(certificate.isOwned).to.be.true;
    });

    it('should revoke a certification request', async () => {
        let certificationRequestId;

        await request(app.getHttpServer())
            .post('/certification-request')
            .send(certificationRequestTestData)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        // need to wait for item to be picked up from the queue and deployed
        await sleep(3000);

        authenticatedUser.rights = Role.Issuer;

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(HttpStatus.OK)
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

        // need to wait for item to be picked up from the queue and deployed
        await sleep(3000);

        authenticatedUser.rights = Role.Issuer;

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/revoke`)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a private certification request', async () => {
        await request(app.getHttpServer())
            .post('/certification-request')
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body.isPrivate).to.be.true;
            });
    });

    it('should approve a private certification request', async () => {
        const {
            body: { id: certificationRequestId, isPrivate }
        } = await request(app.getHttpServer())
            .post('/certification-request')
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        // need to wait for item to be picked up from the queue and deployed
        await sleep(3000);

        expect(isPrivate).to.be.true;

        const {
            body: { success }
        } = await request(app.getHttpServer())
            .put(`/certification-request/${certificationRequestId}/approve`)
            .expect(HttpStatus.OK);

        expect(success).to.be.true;

        await sleep(1000);

        const {
            body: { issuedCertificateTokenId: newCertificateTokenId }
        } = await request(app.getHttpServer())
            .get(`/certification-request/${certificationRequestId}`)
            .expect(HttpStatus.OK);

        authenticatedUser.blockchainAccountAddress = deviceManager.address;

        const {
            body: { energy, issuedPrivately }
        } = await request(app.getHttpServer())
            .get(`/certificate/token-id/${newCertificateTokenId}`)
            .expect(HttpStatus.OK);

        expect(issuedPrivately).to.be.true;
        expect(energy.privateVolume).to.equal(certificationRequestTestData.energy);
    });
});
