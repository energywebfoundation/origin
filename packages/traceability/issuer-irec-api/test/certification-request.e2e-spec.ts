/* eslint-disable no-unused-expressions */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { getAddress } from 'ethers/lib/utils';

import moment from 'moment';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { TestUser, bootstrapTestInstance, deviceManager } from './issuer-irec-api';
import {
    CERTIFICATION_REQUESTS_TABLE_NAME,
    CERTIFICATES_TABLE_NAME,
    FullCertificationRequestDTO,
    IREC_CERTIFICATION_REQUESTS_TABLE_NAME
} from '../src';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificationRequestTestData = {
    to: deviceManager.address,
    energy: '1000000',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    deviceId: '123e4567-e89b-12d3-a456-426614174000',
    files: ['test.pdf', 'test2.pdf']
};

describe('Certification Request tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    before(async () => {
        ({ databaseService, app } = await bootstrapTestInstance());

        await app.init();

        await databaseService.truncate(IREC_CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    afterEach(async () => {
        await databaseService.truncate(IREC_CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATION_REQUESTS_TABLE_NAME);
        await databaseService.truncate(CERTIFICATES_TABLE_NAME);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should return 400 BadRequest if "to" address is invalid', async () => {
        await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
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
                    owner,
                    approved,
                    revoked,
                    files,
                    energy,
                    irecTradeAccountCode,
                    irecIssueRequestId,
                    organizationId,
                    irecAssetId
                }
            } = await request(app.getHttpServer())
                .post('/irec/certification-request')
                .set({ 'test-user': TestUser.OrganizationDeviceManager })
                .send(certReqData)
                .expect(HttpStatus.CREATED);

            expect(deviceId).to.equal(certReqData.deviceId);
            expect(fromTime).to.equal(certReqData.fromTime);
            expect(toTime).to.equal(certReqData.toTime);
            expect(created).to.be.null;
            expect(owner).to.equal(getAddress(certReqData.to));
            expect(approved).to.be.false;
            expect(revoked).to.be.false;
            expect(JSON.stringify(files)).to.equal(JSON.stringify(certReqData.files));
            expect(energy).to.equal(certReqData.energy);
            expect(irecIssueRequestId).to.be.a('string');
            expect(organizationId).to.be.a('string');
            expect(irecAssetId).to.be.a('string');
            expect(irecTradeAccountCode).to.be.a('string');

            const { body: requests } = await request(app.getHttpServer())
                .get(`/irec/certification-request`)
                .set({ 'test-user': TestUser.OrganizationDeviceManager })
                .expect(HttpStatus.OK);

            const cr = requests.find(
                (req: FullCertificationRequestDTO) => req.owner === getAddress(certReqData.to)
            );
            expect(cr).to.be.not.empty;
            expect(cr.irecIssueRequestId).to.be.a('string');
            expect(cr.organizationId).to.be.a('string');
            expect(cr.irecAssetId).to.be.a('string');
            expect(cr.irecTradeAccountCode).to.be.a('string');
        });
    });

    it('should not be able to request certification request twice for the same time period', async () => {
        await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send(certificationRequestTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send(certificationRequestTestData)
            .expect(HttpStatus.CONFLICT);
    });

    it('should approve a certification request and a new certificate should be created', async () => {
        const {
            body: { id: certificationRequestId }
        } = await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send(certificationRequestTestData);

        // need to wait for item to be picked up from the queue and deployed
        await sleep(7500);

        const {
            body: { success }
        } = await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/approve`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.OK);
        expect(success).to.be.true;

        const {
            body: { issuedCertificateId: newCertificateId }
        } = await request(app.getHttpServer())
            .get(`/irec/certification-request/${certificationRequestId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);
        expect(newCertificateId).to.be.above(0);

        await sleep(1000);

        const { body: certificate } = await request(app.getHttpServer())
            .get(`/certificate/${newCertificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(certificate.id).to.be.above(0);
        expect(certificate.deviceId).to.equal(certificationRequestTestData.deviceId);
        expect(certificate.generationStartTime).to.equal(certificationRequestTestData.fromTime);
        expect(certificate.generationEndTime).to.equal(certificationRequestTestData.toTime);
        expect(certificate.creationTime).to.be.above(1);
        expect(certificate.creationBlockHash);
        expect(certificate.issuedPrivately).to.be.false;
        expect(certificate.isOwned).to.be.true;
    });

    it('should revoke a certification request', async () => {
        const {
            body: { id: certificationRequestId }
        } = await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send(certificationRequestTestData)
            .expect(HttpStatus.CREATED);

        // need to wait for item to be picked up from the queue and deployed
        await sleep(7500);

        await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/revoke`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        const { body } = await request(app.getHttpServer())
            .get(`/irec/certification-request/${certificationRequestId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(body.revoked).to.equal(true);
    });

    it('should fail to revoke a revoked certification request', async () => {
        let certificationRequestId;

        await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send(certificationRequestTestData)
            .expect((res) => {
                certificationRequestId = res.body.id;
            });

        // need to wait for item to be picked up from the queue and deployed
        await sleep(7500);

        await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/revoke`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/revoke`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a private certification request', async () => {
        await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body.isPrivate).to.be.true;
            });
    });

    // TO-DO: Check why this test fails. It doesn't fail when it is run with it.only(...
    xit('should approve a private certification request', async () => {
        const {
            body: { id: certificationRequestId, isPrivate }
        } = await request(app.getHttpServer())
            .post('/irec/certification-request')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                ...certificationRequestTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        // need to wait for item to be picked up from the queue and deployed
        await sleep(7500);

        expect(isPrivate).to.be.true;

        const {
            body: { success }
        } = await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/approve`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.OK);

        expect(success).to.be.true;

        await sleep(3000);

        const {
            body: { issuedCertificateId: newCertificateId }
        } = await request(app.getHttpServer())
            .get(`/irec/certification-request/${certificationRequestId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        const {
            body: { energy, issuedPrivately }
        } = await request(app.getHttpServer())
            .get(`/certificate/${newCertificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(issuedPrivately).to.be.true;
        expect(energy.privateVolume).to.equal(certificationRequestTestData.energy);
    });
});
