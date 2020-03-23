import { INestApplication } from '@nestjs/common';
import { ethers } from 'ethers';
import request from 'supertest';

import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('account ask order send', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = '1';
    const dummyAsset = { address: '0x9876', tokenId: '0', deviceId: '0' };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;
    const withdrawalAddress = ethers.Wallet.createRandom().address;

    const createDeposit = (address: string, amount = '1000', asset = dummyAsset) => {
        return transferService.createDeposit({
            address,
            transactionHash,
            amount,
            asset
        });
    };

    const confirmDeposit = () => {
        return transferService.setAsConfirmed(transactionHash, 10000);
    };

    beforeAll(async () => {
        ({ transferService, accountService, databaseService, app } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await app.close();
    });

    let deposit: Transfer;
    let user1Address: string;
    const amount = '1000';

    beforeEach(async () => {
        const { address } = await accountService.getOrCreateAccount(user1Id);
        user1Address = address;
        deposit = await createDeposit(address);
    });

    it('should not be able to create ask order on unconfirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date().toISOString()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(403);
    });

    it('should be able to create ask order on confirmed deposit', async () => {
        await confirmDeposit();

        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date().toISOString()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201)
            .expect(res => {
                const order = res.body as Order;

                expect(order.price).toBe(100);
                expect(order.asset.id).toBe(deposit.asset.id);
            });
    });

    it('should not be able to create ask order bigger than confirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '1001',
            price: 100,
            validFrom: new Date().toISOString()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(403);
    });

    it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '1000',
            price: 100,
            validFrom: new Date().toISOString()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201);

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(403);
    });

    it('should not be able to withdraw without any deposit', async () => {
        const withdrawal: RequestWithdrawalDTO = {
            assetId: deposit.asset.id,
            userId: user1Id,
            amount,
            address: withdrawalAddress
        };

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(403);
    });

    it('should be able to withdraw after confirming deposit', async () => {
        jest.setTimeout(10000);

        await confirmDeposit();

        const withdrawal: RequestWithdrawalDTO = {
            assetId: deposit.asset.id,
            userId: user1Id,
            amount,
            address: withdrawalAddress
        };

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(201);

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect(res => {
                const account = res.body as AccountDTO;

                expect(account.address).toBe(user1Address);
                expect(account.balances.available.length).toBe(1);
                expect(account.balances.available[0].amount).toEqual('0');
                expect(account.balances.available[0].asset).toMatchObject(dummyAsset);
            });

        // wait to withdrawal to be finished to not mess with tx nonces
        await sleep(5000);
    });
});
