/* eslint-disable no-return-assign */
import { CommitmentStatus, Role } from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import request from 'supertest';

import { CertificateService } from '../src/pods/certificate/certificate.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';

describe('Certificate e2e tests', () => {
    let app: INestApplication;
    let userService: UserService;
    let organizationService: OrganizationService;
    let certificateService: CertificateService;

    const generateCommitment = (requestor: string) => ({
        commitment: {
            [requestor]: BigNumber.from(1000)
        },
        rootHash: '0x4d66a6a59ac48f27a549982a5db8a7292bc0ed64d40e12f8b83db32d54c4137f',
        leafs: [
            {
                key: '0xB00F0793d0ce69d7b07db16F92dC982cD6Bdf651',
                value: '250000000',
                salt: 'bgXfryVmdMiMy9vusNmJEg==',
                hash: '0xf858e1805e58e511ac145dedd026f70a5e5907d9a4113f42532bcd1b4f1c6a5a'
            },
            {
                key: '0x5B1B89A48C1fB9b6ef7Fb77C453F2aAF4b156d45',
                value: '750000000',
                salt: 'FWcWYwma+SI6vBNsXgOgTw==',
                hash: '0x8cd6074af53b08971516f85da5a04882a2ba9e04a08051b54bd167b486552c8a'
            }
        ],
        salts: ['bgXfryVmdMiMy9vusNmJEg==', 'FWcWYwma+SI6vBNsXgOgTw=='],
        txHash: '0x43812963521457111f27433c6636499c50d36a6e5bea4a835b4c059aed4ac503'
    });

    before(async () => {
        ({
            app,
            userService,
            organizationService,
            certificateService
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await app.close();
    });

    it('should allow requestor to add ownership commitment for newly created certificate', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'orgUser',
            'orgUserOrg'
        );

        const certificateId = 1;

        await certificateService.create({
            id: certificateId,
            originalRequestor: user.blockchainAccountAddress
        });

        await request(app.getHttpServer())
            .put(`/Certificate/${certificateId}/OwnershipCommitment`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(generateCommitment(user.blockchainAccountAddress))
            .expect(200)
            .expect((res) => {
                const { commitmentStatus } = res.body;

                expect(commitmentStatus).equals(CommitmentStatus.CURRENT);
            });
    });

    it('should deny add ownership commitment for non-requestor', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'orgUser',
            'orgUserOrg'
        );

        const certificateId = 1;

        await certificateService.create({
            id: certificateId,
            originalRequestor: '0x123'
        });

        await request(app.getHttpServer())
            .put(`/Certificate/${certificateId}/OwnershipCommitment`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(generateCommitment(user.blockchainAccountAddress))
            .expect(401);
    });

    it('should allow OrganizationUser to get ownership commitments', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'orgUser',
            'orgUserOrg'
        );

        const certificateId = 1;

        await certificateService.create({
            id: certificateId,
            originalRequestor: user.blockchainAccountAddress
        });

        await request(app.getHttpServer())
            .put(`/Certificate/${certificateId}/OwnershipCommitment`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(generateCommitment(user.blockchainAccountAddress))
            .expect(200)
            .expect((res) => {
                const { commitmentStatus } = res.body;

                expect(commitmentStatus).equals(CommitmentStatus.CURRENT);
            });

        await request(app.getHttpServer())
            .get(`/Certificate/${certificateId}/OwnershipCommitment`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });

    it('should deny ownership commitment change for non-owner', async () => {
        const { accessToken, user } = await registerAndLogin(
            app,
            userService,
            organizationService,
            [Role.OrganizationUser],
            'orgUser',
            'orgUserOrg'
        );

        const certificateId = 1;

        await certificateService.create({
            id: certificateId,
            originalRequestor: '0x123',
            currentOwnershipCommitment: generateCommitment('0x123')
        });

        // Simulate transferring the whole volume to a new address
        const newCommitment = generateCommitment(user.blockchainAccountAddress);

        await request(app.getHttpServer())
            .put(`/Certificate/${certificateId}/OwnershipCommitment`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newCommitment)
            .expect(401);
    });
});
