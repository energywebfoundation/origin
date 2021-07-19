/* eslint-disable no-unused-expressions */
import { IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { BigNumber, constants } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { CertificateDTO, CERTIFICATES_TABLE_NAME, ClaimDTO } from '../src';
import {
    bootstrapTestInstance,
    deviceManager,
    otherDeviceManager,
    registryDeployer,
    TestUser,
    testUsers
} from './issuer-irec-api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '2000000'
};

const claimData: IClaimData = {
    beneficiary: 'Testing beneficiary 1234',
    address: 'Random address 123, Somewhere',
    region: 'Northernmost Region',
    zipCode: '321-45',
    countryCode: 'DE',
    fromDate: moment().subtract(2, 'month').toISOString(),
    toDate: moment().subtract(1, 'month').toISOString()
};

const getUserBlockchainAddress = (user: TestUser) =>
    testUsers.get(user).organization.blockchainAccountAddress;

describe('Certificate tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    const createCertificate = async (toUser?: TestUser): Promise<CertificateDTO> => {
        const { body } = await request(app.getHttpServer())
            .post('/irec/certificate')
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
            .get(`/irec/certificate`)
            .set({ 'test-user': user })
            .expect(HttpStatus.OK);

        return body;
    };

    const getCertificate = async (
        id: CertificateDTO['id'],
        user: TestUser
    ): Promise<CertificateDTO> => {
        const { body } = await request(app.getHttpServer())
            .get(`/irec/certificate/${id}`)
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

    it('should deploy and create a certificate entry in the DB', async () => {
        const {
            id,
            deviceId,
            generationStartTime,
            generationEndTime,
            creationTime,
            creationBlockHash,
            isOwned,
            isClaimed
        } = await createCertificate();

        expect(id).to.be.above(0);
        expect(deviceId).to.equal(certificateTestData.deviceId);
        expect(certificateTestData.fromTime).to.equal(generationStartTime);
        expect(certificateTestData.toTime).to.equal(generationEndTime);
        expect(creationTime).to.be.above(1);
        expect(creationBlockHash);
        expect(isOwned).to.be.false;
        expect(isClaimed).to.be.false;

        const [certificate1] = await getCertificates(TestUser.OrganizationDeviceManager);

        expect(certificate1.isOwned).to.be.true;
        expect(certificate1.energy.publicVolume).to.equal(certificateTestData.energy);
    });

    it('should return sum of all certified energy for a given device id', async () => {
        await createCertificate();
        await createCertificate();

        const startDate = moment.unix(certificateTestData.fromTime).toISOString();
        const endDate = moment.unix(certificateTestData.toTime).toISOString();

        await request(app.getHttpServer())
            .get(
                `/irec/certificate/issuer/certified/${certificateTestData.deviceId}?start=${startDate}&end=${endDate}`
            )
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.text).to.equal(
                    `${constants.Two.mul(BigNumber.from(certificateTestData.energy))}`
                );
            });
    });

    it('should transfer a certificate', async () => {
        const { id: certificateId } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const { isOwned, energy } = await getCertificate(
            certificateId,
            TestUser.OrganizationDeviceManager
        );

        expect(isOwned).to.be.false;
        expect(energy.publicVolume).to.equal('0');
    });

    it('should claim a certificate', async () => {
        const { id: certificateId } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const { isOwned, energy, isClaimed, myClaims, claims } = await getCertificate(
            certificateId,
            TestUser.OrganizationDeviceManager
        );

        expect(isOwned).to.be.false;
        expect(isClaimed).to.be.true;
        expect(energy.publicVolume).to.equal('0');
        expect(energy.claimedVolume).to.equal(certificateTestData.energy);
        expect(
            myClaims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === certificateTestData.energy
            )
        ).to.be.true;
        expect(claims).to.deep.equal(myClaims);
    });

    it('should partially claim a certificate', async () => {
        const { id: certificateId } = await createCertificate();

        const amountToClaim = BigNumber.from(certificateTestData.energy).div(2).toString();

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ amount: amountToClaim, claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const { isOwned, energy, isClaimed, myClaims } = await getCertificate(
            certificateId,
            TestUser.OrganizationDeviceManager
        );

        expect(isOwned).to.be.true;
        expect(isClaimed).to.be.true;
        expect(energy.publicVolume).to.equal(
            BigNumber.from(certificateTestData.energy).sub(amountToClaim).toString()
        );
        expect(energy.claimedVolume).to.equal(amountToClaim);
        expect(
            myClaims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === amountToClaim
            )
        ).to.be.true;
    });

    it('should return all claiming information', async () => {
        const { id: certificateId } = await createCertificate();

        const amount = BigNumber.from(certificateTestData.energy).div(2).toString();

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: otherDeviceManager.address,
                amount
            })
            .expect(HttpStatus.OK);
        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OtherOrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const { claims } = await getCertificate(certificateId, TestUser.OrganizationDeviceManager);

        expect(claims).to.have.length(2);
        expect(
            claims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === amount.toString()
            )
        ).to.be.true;
        expect(
            claims.some(
                (claim: ClaimDTO) =>
                    claim.to === otherDeviceManager.address &&
                    claim.from === otherDeviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === amount.toString()
            )
        ).to.be.true;
    });

    it('should create a private certificate', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/irec/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        const certificate = await getCertificate(id, TestUser.OrganizationDeviceManager);

        expect(certificate.isOwned).to.be.true;
        expect(certificate.energy.privateVolume).to.equal(certificateTestData.energy);
        expect(certificate.energy.publicVolume).to.equal('0');
    });

    it('should transfer a private certificate', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/irec/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        const {
            body: { success: transferSuccess }
        } = await request(app.getHttpServer())
            .put(`/irec/certificate/${id}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.OK);

        expect(transferSuccess).to.be.true;

        const {
            body: { energy: receiverEnergy }
        } = await request(app.getHttpServer())
            .get(`/irec/certificate/${id}`)
            .set({ 'test-user': TestUser.OtherOrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(receiverEnergy.privateVolume).to.equal(certificateTestData.energy);
    });

    it('should get all certificate events', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/irec/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        const { body: events } = await request(app.getHttpServer())
            .get(`/irec/certificate/${id}/events`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(events.length).to.be.above(0);
    });

    it('should get certificates without a blockchain account attached', async () => {
        const { id } = await createCertificate();

        await request(app.getHttpServer())
            .get(`/irec/certificate/${id}`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .get(`/irec/certificate`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);
    });
});
