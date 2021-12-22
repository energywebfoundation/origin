/* eslint-disable no-unused-expressions */
import { IClaimData } from '@energyweb/issuer';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { BigNumber, ContractTransaction } from 'ethers';
import moment from 'moment';
import request from 'supertest';
import polly from 'polly-js';

import { CertificateDTO, CERTIFICATES_TABLE_NAME, ClaimDTO } from '../src';
import { bootstrapTestInstance, deviceManager, TestUser, testUsers } from './issuer-irec-api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const certificateTestData = {
    to: deviceManager.address,
    deviceId: 'ABC-123',
    fromTime: moment().subtract(2, 'month').unix(),
    toTime: moment().subtract(1, 'month').unix(),
    energy: '2000000'
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

    const getCertificatesByTxHash = async (
        txHash: ContractTransaction['hash'],
        user: TestUser
    ): Promise<CertificateDTO[]> => {
        return await polly()
            .waitAndRetry(10)
            .executeForPromise(async (): Promise<CertificateDTO[]> => {
                const res = await request(app.getHttpServer())
                    .get(`/certificate/by-transaction/${txHash}`)
                    .set({ 'test-user': user });

                if (res.status !== HttpStatus.OK) {
                    throw new Error('Not mined yet');
                }
                return res.body;
            });
    };

    const createCertificate = async (options?: {
        toUser?: TestUser;
        isPrivate?: boolean;
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
                isPrivate: options?.isPrivate ?? false
            })
            .expect(HttpStatus.OK);

        await sleep(1000);

        const certs = await getCertificatesByTxHash(txHash, TestUser.Issuer);

        return certs.pop();
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

    it('should claim a certificate', async () => {
        const { id: certificateId } = await createCertificate();

        await request(app.getHttpServer())
            .put(`/irec/certificate/${certificateId}/claim`)
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .send({ claimData })
            .expect(HttpStatus.OK);

        await sleep(10000);

        const certificate = await getCertificate(certificateId, TestUser.OrganizationDeviceManager);

        expect(certificate.isOwned).to.be.false;
        expect(certificate.isClaimed).to.be.true;
        expect(certificate.energy.publicVolume).to.equal('0');
        expect(certificate.energy.claimedVolume).to.equal(certificateTestData.energy);
        expect(
            certificate.myClaims.some(
                (claim: ClaimDTO) =>
                    claim.to === deviceManager.address &&
                    claim.from === deviceManager.address &&
                    claim.claimData.beneficiary === claimData.beneficiary &&
                    claim.value === certificateTestData.energy
            )
        ).to.be.true;
        expect(certificate.claims).to.deep.equal(certificate.myClaims);
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
});
