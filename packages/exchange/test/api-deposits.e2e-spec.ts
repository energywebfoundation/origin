import { DatabaseService } from '@energyweb/origin-backend-utils';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { AccountBalance } from '../src/pods/account-balance/account-balance';
import { AccountService } from '../src/pods/account/account.service';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { createDepositAddress } from './utils';

describe('account deposit confirmation', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = authenticatedUser.organization.id;
    let user1Address = '';

    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const createTransactionHash = () => `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (address: string, amount = '1000', asset = dummyAsset) => {
        return transferService.createDeposit({
            address,
            transactionHash: createTransactionHash(),
            amount,
            asset
        });
    };

    const confirmDeposit = (transactionHash: string) => {
        return transferService.setAsConfirmed(transactionHash, 10000);
    };

    before(async () => {
        ({ transferService, accountService, databaseService, app } = await bootstrapTestInstance());

        await app.init();

        user1Address = await createDepositAddress(accountService, user1Id);
        console.log(`LOG: ${user1Address}`);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should not list unconfirmed deposit', async () => {
        await createDeposit(user1Address);

        await request(app.getHttpServer())
            .get('/account-balance')
            .expect(200)
            .expect((res) => {
                const account = res.body as AccountBalance;

                expect(account.available.length).equals(0);
            });
    });

    it('should list confirmed deposit', async () => {
        const amount = '1000';
        const { transactionHash } = await createDeposit(user1Address, amount);
        await confirmDeposit(transactionHash);

        await request(app.getHttpServer())
            .get('/account-balance')
            .expect(200)
            .expect((res) => {
                const account = res.body as AccountBalance;

                expect(account.available.length).equals(1);
                expect(account.available[0].amount).equals(amount);

                expect(account.available[0].asset).deep.equals(
                    JSON.parse(JSON.stringify(dummyAsset))
                );
            });
    });
});
