/* eslint-disable no-unused-expressions */
import { IClaim, IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { BigNumber, constants } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';
import {
    bootstrapTestInstance,
    deviceManager,
    otherDeviceManager,
    registryDeployer,
    TestUser,
    testUsers
} from './issuer-api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '1000000'
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

const createCertificates = async (app: INestApplication, user: TestUser) => {
    certificateTestData.deviceId = moment().unix().toString();

    await request(app.getHttpServer())
        .post('/certificate')
        .set({ 'test-user': user })
        .send(certificateTestData)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
            const { deviceId, generationStartTime, generationEndTime } = res.body;

            expect(certificateTestData.deviceId).to.equal(deviceId);
            expect(certificateTestData.fromTime).to.equal(generationStartTime);
            expect(certificateTestData.toTime).to.equal(generationEndTime);
        });

    await request(app.getHttpServer())
        .post('/certificate')
        .set({ 'test-user': user })
        .send(certificateTestData)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
            const { deviceId, generationStartTime, generationEndTime } = res.body;

            expect(certificateTestData.deviceId).to.equal(deviceId);
            expect(certificateTestData.fromTime).to.equal(generationStartTime);
            expect(certificateTestData.toTime).to.equal(generationEndTime);
        });
};

describe('Certificate tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

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
        await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                const {
                    id,
                    deviceId,
                    generationStartTime,
                    generationEndTime,
                    creationTime,
                    creationBlockHash,
                    isOwned,
                    isClaimed
                } = res.body;

                expect(id).to.be.above(0);
                expect(deviceId).to.equal(certificateTestData.deviceId);
                expect(certificateTestData.fromTime).to.equal(generationStartTime);
                expect(certificateTestData.toTime).to.equal(generationEndTime);
                expect(creationTime).to.be.above(1);
                expect(creationBlockHash);
                expect(isOwned).to.be.false;
                expect(isClaimed).to.be.false;
            });

        await request(app.getHttpServer())
            .get(`/certificate`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const { isOwned, energy } = res.body[0];

                expect(isOwned).to.be.true;
                expect(energy.publicVolume).to.equal(certificateTestData.energy);
            });
    });

    xit('should transfer a certificate', async () => {
        const {
            body: { id: certificateId }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect((transferResponse) => {
                expect(transferResponse.body.success).to.be.true;
            });

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { isOwned, energy } = getResponse.body;

                expect(isOwned).to.be.false;
                expect(energy.publicVolume).to.equal('0');
            });
    });

    it('should claim a certificate', async () => {
        const {
            body: { id: certificateId }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await sleep(10000);

        const {
            body: { isOwned, energy, isClaimed, myClaims, claims }
        } = await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(isOwned).to.be.false;
        expect(isClaimed).to.be.true;
        expect(energy.publicVolume).to.equal('0');
        expect(energy.claimedVolume).to.equal(certificateTestData.energy);
        expect(
            myClaims.some(
                (claim: IClaim) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === parseInt(certificateTestData.energy, 10)
            )
        ).to.be.true;
        expect(claims).to.deep.equal(myClaims);
    });

    it('should partially claim a certificate', async () => {
        const {
            body: { id: certificateId }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                energy: '1000000'
            })
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ amount: '200000', claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const {
            body: { isOwned, energy, isClaimed, myClaims }
        } = await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(isOwned).to.be.true;
        expect(isClaimed).to.be.true;
        expect(energy.publicVolume).to.equal('800000');
        expect(energy.claimedVolume).to.equal('200000');
        expect(
            myClaims.some(
                (claim: IClaim) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === parseInt('200000', 10)
            )
        ).to.be.true;
    });

    it('should return all claiming information', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        const amount = parseInt(certificateTestData.energy, 10) / 2;

        await request(app.getHttpServer())
            .put(`/certificate/${id}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: otherDeviceManager.address,
                amount
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/certificate/${id}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .put(`/certificate/${id}/claim`)
            .set({ 'test-user': TestUser.OtherOrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { claims } = getResponse.body;

                expect(claims).to.have.length(2);
                expect(
                    claims.some(
                        (claim: IClaim) =>
                            claim.to === deviceManager.address &&
                            claim.from === deviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === amount
                    )
                ).to.be.true;
                expect(
                    claims.some(
                        (claim: IClaim) =>
                            claim.to === otherDeviceManager.address &&
                            claim.from === otherDeviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === amount
                    )
                ).to.be.true;
            });
    });

    xit('should bulk claim certificates', async () => {
        const value = '1000000';

        const {
            body: { id: certificateId1 }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        const {
            body: { id: certificateId2 }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .put(`/certificate/bulk-claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData, certificateIds: [certificateId1, certificateId2] })
            .expect(HttpStatus.OK)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await sleep(2000);

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId1}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { isOwned, energy, isClaimed, myClaims } = getResponse.body;

                expect(isOwned).to.be.false;
                expect(isClaimed).to.be.true;
                expect(energy.publicVolume).to.equal('0');
                expect(energy.claimedVolume).to.equal(value);
                expect(
                    myClaims.some(
                        (claim: IClaim) =>
                            claim.to === deviceManager.address &&
                            claim.from === deviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === parseInt(value, 10)
                    )
                ).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId2}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { isOwned, energy, isClaimed, myClaims } = getResponse.body;

                expect(isOwned).to.be.false;
                expect(isClaimed).to.be.true;
                expect(energy.publicVolume).to.equal('0');
                expect(energy.claimedVolume).to.equal(value);
                expect(
                    myClaims.some(
                        (claim: IClaim) =>
                            claim.to === deviceManager.address &&
                            claim.from === deviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === parseInt(value, 10)
                    )
                ).to.be.true;
            });
    });

    it('should create a private certificate', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { isOwned, energy } = getResponse.body;

                expect(isOwned).to.be.true;
                expect(energy.privateVolume).to.equal(certificateTestData.energy);
                expect(energy.publicVolume).to.equal('0');
            });
    });

    it('should transfer a private certificate', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED);

        const {
            body: { success: transferSuccess }
        } = await request(app.getHttpServer())
            .put(`/certificate/${id}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: testUsers.get(TestUser.Issuer).organization.blockchainAccountAddress,
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.OK);

        expect(transferSuccess).to.be.true;

        const {
            body: { energy: receiverEnergy }
        } = await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.Issuer })
            .expect(HttpStatus.OK);

        expect(receiverEnergy.privateVolume).to.equal(certificateTestData.energy);
    });

    xit('should claim a private certificate', async () => {
        const value = '1000000';

        let certificateId: number;

        await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                certificateId = res.body.id;
            });

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((getResponse) => {
                const { isOwned, energy, isClaimed, myClaims, latestCommitment } = getResponse.body;

                expect(isOwned).to.be.false;
                expect(isClaimed).to.be.true;
                expect(energy.publicVolume).to.equal('0');
                expect(energy.claimedVolume).to.equal(value);
                expect(
                    myClaims.some(
                        (claim: IClaim) =>
                            claim.to === deviceManager.address &&
                            claim.from === deviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === parseInt(value, 10)
                    )
                ).to.be.true;
                expect(latestCommitment.commitment[deviceManager.address]).to.equal('0');
            });
    });

    it('should get all certificate events', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        const { body: events } = await request(app.getHttpServer())
            .get(`/certificate/${id}/events`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(events.length).to.be.above(0);
    });

    it('should return sum of all certified energy for a given device id', async () => {
        await createCertificates(app, TestUser.Issuer);

        const startDate = moment.unix(certificateTestData.fromTime).toISOString();
        const endDate = moment.unix(certificateTestData.toTime).toISOString();

        await request(app.getHttpServer())
            .get(
                `/certificate/issuer/certified/${certificateTestData.deviceId}?start=${startDate}&end=${endDate}`
            )
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.text).to.equal(
                    `${BigNumber.from(constants.Two).mul(
                        BigNumber.from(certificateTestData.energy)
                    )}`
                );
            });
    });

    it('should get certificates without a blockchain account attached', async () => {
        const {
            body: { id }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send(certificateTestData)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .get(`/certificate`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);
    });
});
