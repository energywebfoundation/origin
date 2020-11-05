/* eslint-disable no-unused-expressions */
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import moment from 'moment';
import { IClaimData, IClaim } from '@energyweb/issuer';
import { Role } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import {
    authenticatedUser,
    bootstrapTestInstance,
    deviceManager,
    registryDeployer
} from './issuer-api';
import { CERTIFICATES_TABLE_NAME } from '../src/pods/certificate/certificate.entity';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '1000000'
};

const setUserRole = (role: Role) => {
    authenticatedUser.rights = role;
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
        await databaseService.cleanUp();
        await app.close();
    });

    it('should deploy and create a certificate entry in the DB', async () => {
        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                const {
                    deviceId,
                    generationStartTime,
                    generationEndTime,
                    creationTime,
                    creationBlockHash,
                    tokenId,
                    isOwned,
                    isClaimed,
                    energy
                } = res.body;

                expect(deviceId).to.equal(certificateTestData.deviceId);
                expect(certificateTestData.fromTime).to.equal(generationStartTime);
                expect(certificateTestData.toTime).to.equal(generationEndTime);
                expect(creationTime).to.be.above(1);
                expect(creationBlockHash);
                expect(tokenId).to.be.above(-1);
                expect(isOwned).to.be.true;
                expect(isClaimed).to.be.false;
                expect(energy.publicVolume).to.equal(certificateTestData.energy);
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .get(`/certificate`)
            .expect(200)
            .expect((res) => {
                expect(res.body.length).to.equal(1);
            });
    });

    it('should transfer a certificate', async () => {
        let certificateId: number;
        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                const { id, isOwned, energy } = res.body;
                certificateId = id;

                expect(isOwned).to.be.true;
                expect(energy.publicVolume).to.equal(certificateTestData.energy);
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/transfer`)
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect((transferResponse) => {
                expect(transferResponse.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .expect(200)
            .expect((getResponse) => {
                const { isOwned, energy } = getResponse.body;

                expect(isOwned).to.be.false;
                expect(energy.publicVolume).to.equal('0');
            });
    });

    it('should claim a certificate', async () => {
        const value = '1000000';
        const claimData: IClaimData = {
            beneficiary: 'Testing beneficiary 1234',
            address: 'Random address 123, Somewhere',
            region: 'Northernmost Region',
            zipCode: '321-45',
            countryCode: 'DE'
        };

        let certificateId: number;

        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                const { id, isOwned, energy, isClaimed, myClaims } = res.body;

                expect(isOwned).to.be.true;
                expect(isClaimed).to.be.false;
                expect(energy.publicVolume).to.equal(certificateTestData.energy);
                expect(energy.claimedVolume).to.equal('0');
                expect(myClaims).to.be.empty;

                certificateId = id;
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .send({ claimData })
            .expect(200)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .expect(200)
            .expect((getResponse) => {
                const { isOwned, energy, isClaimed, myClaims } = getResponse.body;

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
                            claim.value === parseInt(value, 10)
                    )
                ).to.be.true;
            });
    });

    xit('should bulk claim certificates', async () => {
        const value = '1000000';
        const claimData: IClaimData = {
            beneficiary: 'Testing beneficiary 1234',
            address: 'Random address 123, Somewhere',
            region: 'Northernmost Region',
            zipCode: '321-45',
            countryCode: 'DE'
        };

        let certificateId1: number;
        let certificateId2: number;

        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                certificateId1 = res.body.id;
            });

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                certificateId2 = res.body.id;
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .put(`/certificate/bulk-claim`)
            .send({ claimData, certificateIds: [certificateId1, certificateId2] })
            .expect(200)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await sleep(2000);

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId1}`)
            .expect(200)
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
            .expect(200)
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
        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(201)
            .expect((res) => {
                const { latestCommitment } = res.body;

                expect(latestCommitment.commitment[deviceManager.address]).to.equal(
                    certificateTestData.energy
                );
            });
    });

    it('should transfer a private certificate', async () => {
        let certificateId;
        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(201)
            .expect((res) => {
                certificateId = res.body.id;
                const { latestCommitment } = res.body;

                expect(latestCommitment.commitment[deviceManager.address]).to.equal(
                    certificateTestData.energy
                );
                expect(latestCommitment.commitment[registryDeployer.address]).to.equal(undefined);
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/transfer`)
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect(200)
            .expect((transferResponse) => {
                expect(transferResponse.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .expect(200)
            .expect((getResponse) => {
                const { latestCommitment } = getResponse.body;

                expect(latestCommitment.commitment[deviceManager.address]).to.equal('0');
                expect(latestCommitment.commitment[registryDeployer.address]).to.equal(
                    certificateTestData.energy
                );
            });
    });

    xit('should claim a private certificate', async () => {
        const value = '1000000';
        const claimData: IClaimData = {
            beneficiary: 'Testing beneficiary 1234',
            address: 'Random address 123, Somewhere',
            region: 'Northernmost Region',
            zipCode: '321-45',
            countryCode: 'DE'
        };

        let certificateId: number;

        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send({
                ...certificateTestData,
                isPrivate: true
            })
            .expect(201)
            .expect((res) => {
                certificateId = res.body.id;
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .send({ claimData })
            .expect(200)
            .expect((claimResponse) => {
                expect(claimResponse.body.success).to.be.true;
            });

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}`)
            .expect(200)
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
        let certificateId: number;

        setUserRole(Role.Issuer);

        await request(app.getHttpServer())
            .post('/certificate')
            .send(certificateTestData)
            .expect(201)
            .expect((res) => {
                certificateId = res.body.id;
            });

        setUserRole(Role.OrganizationDeviceManager);

        await request(app.getHttpServer())
            .get(`/certificate/${certificateId}/events`)
            .expect(200)
            .expect((eventsResponse) => {
                const { body: events } = eventsResponse;
                expect(events.length).to.be.above(0);
            });
    });
});
