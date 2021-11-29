import { AccountService, CreateAssetDTO, TransferService, testUtils } from '@energyweb/exchange';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { authenticatedUser, bootstrapTestInstance, TestUser } from './exchange';
import { expect } from 'chai';

describe('export tests', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

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
        ({ transferService, databaseService, accountService, app } = await bootstrapTestInstance());

        await app.init();

        const address = await testUtils.createDepositAddress(accountService, user1Id);
        await createDeposit(address, '1000', windAsset);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    // Turned this test off because it's hard to replicate in a test environment
    // For now only tested this feature through the UI
    xit('should export an asset', async () => {
        const {
            body: { available: availableBefore }
        } = await request(app.getHttpServer()).get('/account-balance').expect(HttpStatus.OK);

        await request(app.getHttpServer())
            .post('/irec/export')
            .send({
                assetId: availableBefore[0].asset.id,
                recipientTradeAccount: 'TESTREDEMPTIONACCOUNT',
                amount: availableBefore[0].amount
            })
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        const {
            body: { locked }
        } = await request(app.getHttpServer())
            .get('/account-balance')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK);

        expect(locked).to.have.length(1);
        expect(locked[0].asset.id).to.equal(availableBefore[0].asset.id);
        expect(locked[0].amount).to.equal(availableBefore[0].amount);
    });
});
