import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';

describe('account deposit confirmation', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = authenticatedUser.organization.id;

    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const createTransactionHash = () => `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    let user1Address: string;

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

        const { address } = await accountService.getOrCreateAccount(user1Id);
        user1Address = address;
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should not list unconfirmed deposit', async () => {
        const { address } = await accountService.getOrCreateAccount(user1Id);

        await createDeposit(address);

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect((res) => {
                const account = res.body as AccountDTO;

                expect(account.address).equals(user1Address);
                expect(account.balances.available.length).equals(0);
            });
    });

    it('should list confirmed deposit', async () => {
        const amount = '1000';
        const { address } = await accountService.getOrCreateAccount(user1Id);

        const { transactionHash } = await createDeposit(address, amount);
        await confirmDeposit(transactionHash);

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect((res) => {
                const account = res.body as AccountDTO;

                expect(account.address).equals(user1Address);
                expect(account.balances.available.length).equals(1);
                expect(account.balances.available[0].amount).equals(amount);

                expect(account.balances.available[0].asset).deep.equals(
                    JSON.parse(JSON.stringify(dummyAsset))
                );
            });
    });
});
