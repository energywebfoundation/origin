/* eslint-disable no-unused-expressions */
import { IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { expect } from 'chai';
import { BigNumber, constants, ContractTransaction } from 'ethers';
import moment from 'moment';
import request from 'supertest';
import polly from 'polly-js';

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
import { ClaimDTO, IGetAllCertificatesOptions } from '../src';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '1000000',
    metadata: 'data'
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

describe('Certificate tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

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

    const getAllCertificates = async (
        user: TestUser,
        query: Partial<Record<keyof IGetAllCertificatesOptions, string>>
    ): Promise<CertificateDTO[]> => {
        const queryString = new URLSearchParams(query).toString();
        const { body } = await request(app.getHttpServer())
            .get(`/certificate?${queryString}`)
            .set({ 'test-user': user })
            .expect(HttpStatus.OK);

        return body;
    };

    const getCertificatesByTxHash = async (
        txHash: ContractTransaction['hash'],
        user: TestUser
    ): Promise<CertificateDTO[]> => {
        const certificates = await polly()
            .waitAndRetry(5)
            .executeForPromise(async (): Promise<CertificateDTO[]> => {
                const res = await request(app.getHttpServer())
                    .get(`/certificate/by-transaction/${txHash}`)
                    .set({ 'test-user': user });

                if (res.status !== HttpStatus.OK) {
                    throw new Error('Not mined yet');
                }
                return res.body;
            });

        return certificates;
    };

    const createCertificate = async (options?: {
        toUser?: TestUser;
        isPrivate?: boolean;
        toTime?: Date;
        fromTime?: Date;
        deviceId?: string;
    }): Promise<CertificateDTO> => {
        const {
            body: { txHash }
        } = await request(app.getHttpServer())
            .post('/certificate')
            .set({ 'test-user': TestUser.Issuer })
            .send({
                ...certificateTestData,
                to: options?.toUser
                    ? getUserBlockchainAddress(options.toUser)
                    : certificateTestData.to,
                isPrivate: options?.isPrivate ?? false,
                toTime: options?.toTime
                    ? moment(options.toTime).unix()
                    : certificateTestData.toTime,
                fromTime: options?.fromTime
                    ? moment(options.fromTime).unix()
                    : certificateTestData.fromTime,
                deviceId: options?.deviceId ?? certificateTestData.deviceId
            })
            .expect(HttpStatus.OK);

        await sleep(1000);

        const certs = await getCertificatesByTxHash(txHash, TestUser.Issuer);

        return certs.pop();
    };

    const getCertificates = async (user: TestUser): Promise<CertificateDTO[]> => {
        const { body } = await request(app.getHttpServer())
            .get(`/certificate`)
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
            creationTransactionHash,
            isOwned,
            isClaimed,
            metadata
        } = await createCertificate();

        expect(id).to.be.above(0);
        expect(deviceId).to.equal(certificateTestData.deviceId);
        expect(certificateTestData.fromTime).to.equal(generationStartTime);
        expect(certificateTestData.toTime).to.equal(generationEndTime);
        expect(creationTime).to.be.above(1);
        expect(creationTransactionHash);
        expect(isOwned).to.be.false;
        expect(isClaimed).to.be.false;
        expect(metadata).to.equal('data');

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
                `/certificate/issuer/certified/${certificateTestData.deviceId}?start=${startDate}&end=${endDate}`
            )
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.text).to.equal(
                    `${constants.Two.mul(BigNumber.from(certificateTestData.energy))}`
                );
            });
    });

    it('should batch issue certificates (with correct order)', async () => {
        const orderedNumbers = new Array(10).fill(null).map((_, i) => i.toString());
        const certificatesPayload = orderedNumbers.map((i) => ({
            ...certificateTestData,
            metadata: i
        }));

        const {
            body: { txHash }
        } = await request(app.getHttpServer())
            .post(`/certificate-batch/issue`)
            .set({ 'test-user': TestUser.Issuer })
            .send(certificatesPayload)
            .expect(HttpStatus.OK);

        expect(txHash).to.be.a('string');

        await sleep(15000);

        const certificates = await getCertificatesByTxHash(
            txHash,
            TestUser.OrganizationDeviceManager
        );

        expect(certificates).to.have.length(10);
        expect(certificates.map((c) => c.metadata)).to.have.ordered.members(orderedNumbers);

        expect(certificates[0].isOwned).to.be.true;
        expect(certificates[0].energy.publicVolume).to.equal(certificateTestData.energy);
    });

    it('should transfer a certificate', async () => {
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
            .put(`/certificate/${certificateId}/claim`)
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
            .put(`/certificate/${certificateId}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: otherDeviceManager.address,
                amount
            })
            .expect(HttpStatus.OK);

        await sleep(10000);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .put(`/certificate/${certificateId}/claim`)
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

    it('should batch claim certificates', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/certificate-batch/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                { id: certificateId1, claimData },
                { id: certificateId2, claimData, amount: certificateTestData.energy }
            ])
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificate1 = await getCertificate(
            certificateId1,
            TestUser.OrganizationDeviceManager
        );

        expect(certificate1.isOwned).to.be.false;
        expect(certificate1.isClaimed).to.be.true;
        expect(certificate1.energy.publicVolume).to.equal('0');
        expect(certificate1.energy.claimedVolume).to.equal(certificateTestData.energy);
        expect(
            certificate1.myClaims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === certificateTestData.energy
            )
        ).to.be.true;

        const certificate2 = await getCertificate(
            certificateId2,
            TestUser.OrganizationDeviceManager
        );

        expect(certificate2.isOwned).to.be.false;
        expect(certificate2.isClaimed).to.be.true;
        expect(certificate2.energy.publicVolume).to.equal('0');
        expect(certificate2.energy.claimedVolume).to.equal(certificateTestData.energy);
        expect(
            certificate2.myClaims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                    claim.value === certificateTestData.energy
            )
        ).to.be.true;
    });

    it('should batch claim certificates with specified amounts', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate();

        const halfAmount = BigNumber.from(certificateTestData.energy).div(2).toString();

        await request(app.getHttpServer())
            .put(`/certificate-batch/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                { id: certificateId1, claimData, amount: halfAmount },
                { id: certificateId2, claimData, amount: halfAmount }
            ])
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificate1 = await getCertificate(
            certificateId1,
            TestUser.OrganizationDeviceManager
        );

        expect(certificate1.isOwned).to.be.true;
        expect(certificate1.isClaimed).to.be.true;
        expect(certificate1.energy.publicVolume).to.equal(halfAmount);
        expect(certificate1.energy.claimedVolume).to.equal(halfAmount);

        const certificate2 = await getCertificate(
            certificateId2,
            TestUser.OrganizationDeviceManager
        );

        expect(certificate2.isOwned).to.be.true;
        expect(certificate2.isClaimed).to.be.true;
        expect(certificate2.energy.publicVolume).to.equal(halfAmount);
        expect(certificate2.energy.claimedVolume).to.equal(halfAmount);
    });

    it('should reject batch claiming un-owned certificate', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate({
            toUser: TestUser.OtherOrganizationDeviceManager
        });

        const {
            body: { message }
        } = await request(app.getHttpServer())
            .put(`/certificate-batch/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                { id: certificateId1, claimData, amount: certificateTestData.energy },
                { id: certificateId2, claimData, amount: certificateTestData.energy }
            ])
            .expect(HttpStatus.FORBIDDEN);

        expect(message).to.include(certificateId2.toString());
    });

    it('should batch transfer whole certificates', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/certificate-batch/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                {
                    id: certificateId1,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager)
                },
                {
                    id: certificateId2,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: certificateTestData.energy
                }
            ])
            .expect(HttpStatus.OK);
    });

    it('should batch transfer certificates partially', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate();

        const halfAmount = BigNumber.from(certificateTestData.energy).div(2).toString();

        await request(app.getHttpServer())
            .put(`/certificate-batch/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                {
                    id: certificateId1,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: halfAmount
                },
                {
                    id: certificateId2,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: halfAmount
                }
            ])
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificate1DeviceManager = await getCertificate(
            certificateId1,
            TestUser.OrganizationDeviceManager
        );
        expect(certificate1DeviceManager.isOwned).to.be.true;
        expect(certificate1DeviceManager.energy.publicVolume).to.equal(halfAmount);

        const certificate1Other = await getCertificate(
            certificateId1,
            TestUser.OtherOrganizationDeviceManager
        );
        expect(certificate1Other.isOwned).to.be.true;
        expect(certificate1Other.energy.publicVolume).to.equal(halfAmount);

        const certificate2DeviceManager = await getCertificate(
            certificateId2,
            TestUser.OrganizationDeviceManager
        );
        expect(certificate2DeviceManager.isOwned).to.be.true;
        expect(certificate2DeviceManager.energy.publicVolume).to.equal(halfAmount);

        const certificate2Other = await getCertificate(
            certificateId2,
            TestUser.OtherOrganizationDeviceManager
        );
        expect(certificate2Other.isOwned).to.be.true;
        expect(certificate2Other.energy.publicVolume).to.equal(halfAmount);
    });

    it('should reject batch transferring un-owned certificate', async () => {
        const { id: certificateId1 } = await createCertificate();
        const { id: certificateId2 } = await createCertificate({
            toUser: TestUser.OtherOrganizationDeviceManager
        });

        const {
            body: { message }
        } = await request(app.getHttpServer())
            .put(`/certificate-batch/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                {
                    id: certificateId1,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: certificateTestData.energy
                },
                {
                    id: certificateId2,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: certificateTestData.energy
                }
            ])
            .expect(HttpStatus.FORBIDDEN);

        expect(message).to.include(certificateId2.toString());
    });

    it('should create a private certificate', async () => {
        let cert = await createCertificate({ isPrivate: true });

        cert = await getCertificate(cert.id, TestUser.OrganizationDeviceManager);

        expect(cert.isOwned).to.be.true;
        expect(cert.energy.privateVolume).to.equal(certificateTestData.energy);
        expect(cert.energy.publicVolume).to.equal('0');
    });

    it('should transfer a private certificate', async () => {
        const { id } = await createCertificate({ isPrivate: true });

        await request(app.getHttpServer())
            .put(`/certificate/${id}/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.OK);

        const {
            body: { energy: receiverEnergy }
        } = await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.OtherOrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(receiverEnergy.privateVolume).to.equal(certificateTestData.energy);
    });

    xit('should claim a private certificate', async () => {
        const value = '1000000';

        const { id: certificateId } = await createCertificate({ isPrivate: true });

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
                        (claim: ClaimDTO) =>
                            claim.to === deviceManager.address &&
                            claim.from === deviceManager.address &&
                            JSON.stringify(claim.claimData) === JSON.stringify(claimData) &&
                            claim.value === value
                    )
                ).to.be.true;
                expect(latestCommitment.commitment[deviceManager.address]).to.equal('0');
            });
    });

    it('should get all certificate events', async () => {
        const { id } = await createCertificate();

        const { body: events } = await request(app.getHttpServer())
            .get(`/certificate/${id}/events`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(events.length).to.be.above(0);
    });

    it('should get all certificates within given generationEnd timeframe', async () => {
        await createCertificate({ toTime: new Date('2021-11-07T14:00:00.000Z') });
        const expectedCert = await createCertificate({
            toTime: new Date('2021-11-07T16:00:00.000Z')
        });
        await createCertificate({ toTime: new Date('2021-11-07T18:00:00.000Z') });

        const certificates = await getAllCertificates(TestUser.OrganizationDeviceManager, {
            generationEndFrom: new Date('2021-11-07T15:00:00.000Z').toISOString(),
            generationEndTo: new Date('2021-11-07T17:00:00.000Z').toISOString()
        });

        expect(certificates.length).to.be.eql(1);
        expect(certificates[0].id).to.be.eql(expectedCert.id);
    });

    it('should get all certificates within given generationStart timeframe', async () => {
        await createCertificate({ fromTime: new Date('2021-11-07T14:00:00.000Z') });
        const expectedCert = await createCertificate({
            fromTime: new Date('2021-11-07T16:00:00.000Z')
        });
        await createCertificate({ fromTime: new Date('2021-11-07T18:00:00.000Z') });

        const certificates = await getAllCertificates(TestUser.OrganizationDeviceManager, {
            generationStartFrom: new Date('2021-11-07T15:00:00.000Z').toISOString(),
            generationStartTo: new Date('2021-11-07T17:00:00.000Z').toISOString()
        });

        expect(certificates.length).to.be.eql(1);
        expect(certificates[0].id).to.be.eql(expectedCert.id);
    });

    it('should get all certificates of given deviceId', async () => {
        await createCertificate({ deviceId: 'device1' });
        const expectedCert = await createCertificate({ deviceId: 'device2' });
        await createCertificate({ deviceId: 'device3' });

        const certificates = await getAllCertificates(TestUser.OrganizationDeviceManager, {
            deviceId: 'device2'
        });

        expect(certificates.length).to.be.eql(1);
        expect(certificates[0].id).to.be.eql(expectedCert.id);
    });

    it('should get certificates without a blockchain account attached', async () => {
        const { id } = await createCertificate();

        await request(app.getHttpServer())
            .get(`/certificate/${id}`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .get(`/certificate`)
            .set({ 'test-user': TestUser.UserWithoutBlockchainAccount })
            .expect(HttpStatus.OK);
    });

    it('should reject transferring of not existing certificate', async () => {
        await request(app.getHttpServer())
            .put(`/certificate/1122334455/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({
                to: registryDeployer.address,
                amount: certificateTestData.energy
            })
            .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject batch transferring of not existing certificate', async () => {
        const {
            body: { message }
        } = await request(app.getHttpServer())
            .put(`/certificate-batch/transfer`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                {
                    id: 1122334455,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: certificateTestData.energy
                },
                {
                    id: 1122334456,
                    to: getUserBlockchainAddress(TestUser.OtherOrganizationDeviceManager),
                    amount: certificateTestData.energy
                }
            ])
            .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject claim of not existing certificate', async () => {
        await request(app.getHttpServer())
            .put(`/certificate/1122334455/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ amount: '1', claimData })
            .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject batch claim of not existing certificate', async () => {
        await request(app.getHttpServer())
            .put(`/certificate-batch/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send([
                { id: 1122334455, claimData, amount: '1' },
                { id: 1122334456, claimData, amount: '1' }
            ])
            .expect(HttpStatus.NOT_FOUND);
    });
});
