import { AccountService, CreateAssetDTO, TransferService, testUtils } from '@energyweb/exchange';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { expect } from 'chai';
import request from 'supertest';
import {
    authenticatedUser,
    bootstrapTestInstance,
    TestUser,
    deviceManager,
    ClaimRequestedHandler
} from './exchange';
import { GetIrecTradeTransferQuery } from '../src';

describe('Irec exchange transfer controller', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let claimRequestedHandler: ClaimRequestedHandler;
    let queryBus: QueryBus;

    const user1Id = String(authenticatedUser.organization.id);

    const windAsset: CreateAssetDTO = {
        address: '0x9876',
        tokenId: '1',
        deviceId: 'deviceId2',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const createDeposit = async (
        address: string,
        amount = '1000',
        asset: CreateAssetDTO,
        blockNumber = 123456
    ) => {
        const deposit = await transferService.createDeposit({
            address,
            transactionHash: `0x${((Math.random() * 0xffffff) << 0).toString(16)}`,
            amount,
            blockNumber,
            asset
        });

        await transferService.setAsConfirmed(deposit.transactionHash, 10000);

        return deposit;
    };

    before(async () => {
        ({
            transferService,
            databaseService,
            accountService,
            app,
            claimRequestedHandler,
            queryBus
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should claim irec certificate', async () => {
        const address = await testUtils.createDepositAddress(accountService, user1Id);
        const deposit = await createDeposit(address, '1000', windAsset);

        // Create certification request
        const {
            body: { id: certificationRequestId }
        } = await request(app.getHttpServer())
            .post('/irec/certification-request')
            .send({
                to: deviceManager.address,
                energy: '100',
                fromTime: 0,
                toTime: 1,
                deviceId: 'deviceId2'
            })
            .set({ 'test-user': TestUser.OrganizationDeviceManager });

        // Approve certification request
        await request(app.getHttpServer())
            .put(`/irec/certification-request/${certificationRequestId}/approve`)
            .send()
            .set({ 'test-user': TestUser.Issuer });

        await request(app.getHttpServer())
            .post('/irec/transfer/claim')
            .send({
                amount: '100',
                beneficiary: {
                    irecId: 1,
                    name: 'beneficiary',
                    countryCode: 'countryCode',
                    location: 'location'
                },
                assetId: deposit.asset.id,
                periodStartDate: new Date('2022-03-10T16:00:00.000Z').toISOString(),
                periodEndDate: new Date('2022-03-10T17:00:00.000Z').toISOString(),
                purpose: 'purpose'
            })
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(function (res) {
                if (res.status != 201) {
                    console.log(JSON.stringify(res.body, null, 2));
                }
            })
            .expect(HttpStatus.CREATED);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        const expectedTransfer = {
            userId: '1000',
            amount: '100',
            direction: 'Claim'
        };

        const expectedTransferClaimData = {
            beneficiary: 'beneficiary',
            countryCode: 'countryCode',
            location: 'location',
            periodStartDate: '2022-03-10T16:00:00.000Z',
            periodEndDate: '2022-03-10T17:00:00.000Z',
            purpose: 'purpose',
            irecVerificationUrl:
                'https://baseUrl/public/certificates/en/PwC0IE2x+ugRPJRYhwlGCTjEqk7RDz0x+zzp6Ks0k1M=',
            irecStartCertNum: '0000-0000-0000-0001',
            irecEndCertNum: '0000-0000-0000-1000'
        };

        const actualTransfer = claimRequestedHandler.handledEvents[0].transfer;

        for (const [key, value] of Object.entries(expectedTransfer)) {
            expect(actualTransfer).to.have.property(key, value);
        }

        for (const [key, value] of Object.entries(expectedTransferClaimData)) {
            expect(actualTransfer.claimData).to.have.property(key, value);
        }

        const irecTransfers = await queryBus.execute(new GetIrecTradeTransferQuery());

        expect(irecTransfers[0]).to.have.property('tokenId', windAsset.tokenId);
        expect(irecTransfers[0]).to.have.property('verificationKey', 'S4ELosCw');
    });
});
