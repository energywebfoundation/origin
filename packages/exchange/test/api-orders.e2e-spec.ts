import { INestApplication } from '@nestjs/common';
import { ethers } from 'ethers';
import request from 'supertest';

import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { OrderStatus } from '../src/pods/order/order-status.enum';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('account ask order send', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = '1';
    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

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
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    let deposit: Transfer;
    let user1Address: string;
    const amount = '1000';

    beforeEach(async () => {
        await databaseService.truncate('order');
        await databaseService.truncate('transfer');

        ({ address: user1Address } = await accountService.getOrCreateAccount(user1Id));
        deposit = await createDeposit(user1Address);
    });

    it('should not be able to create ask order on unconfirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(403);
    });

    it('should be able to create ask order on confirmed deposit', async () => {
        await confirmDeposit();

        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201)
            .expect((res) => {
                const order = res.body as Order;

                expect(order.price).toBe(100);
                expect(order.startVolume).toBe('100');
                expect(order.assetId).toBe(deposit.asset.id);
                expect(new Date(order.product.generationFrom)).toStrictEqual(
                    dummyAsset.generationFrom
                );
                expect(new Date(order.product.generationTo)).toStrictEqual(dummyAsset.generationTo);
            });
    });

    it('should not be able to create ask order bigger than confirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '1001',
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(403);
    });

    it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '1000',
            price: 100,
            validFrom: new Date()
        };

        await confirmDeposit();

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(201);

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(403);
    });

    it('should not be able to withdraw without any deposit', async () => {
        const withdrawal: RequestWithdrawalDTO = {
            assetId: deposit.asset.id,
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
            .expect((res) => {
                const account = res.body as AccountDTO;

                expect(account.address).toBe(user1Address);
                expect(account.balances.available.length).toBe(1);
                expect(account.balances.available[0].amount).toEqual('0');
                expect(account.balances.available[0].asset).toMatchObject(
                    JSON.parse(JSON.stringify(dummyAsset))
                );
            });

        // wait to withdrawal to be finished to not mess with tx nonces
        await sleep(5000);
    });

    it('should be able to create and cancel bid', async () => {
        const volume = '1000';

        const createBid: CreateBidDTO = {
            price: 100,
            validFrom: new Date(),
            volume,
            product: { deviceType: ['Solar'] }
        };

        let order: Order;

        await request(app.getHttpServer())
            .post('/orders/bid')
            .send(createBid)
            .expect(201)
            .expect((res) => {
                order = res.body as Order;

                expect(order.price).toBe(100);
                expect(order.startVolume).toBe(volume);
                expect(order.status).toBe(OrderStatus.Active);
            });

        await request(app.getHttpServer())
            .post(`/orders/${order.id}/cancel`)
            .expect(202)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).toBe(order.id);
                expect(cancelled.status).toBe(OrderStatus.PendingCancellation);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/orders/${order.id}`)
            .expect(200)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).toBe(order.id);
                expect(cancelled.status).toBe(OrderStatus.Cancelled);
            });
    });
});
