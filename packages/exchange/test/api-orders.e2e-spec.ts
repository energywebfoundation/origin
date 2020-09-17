import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { ethers, Contract } from 'ethers';
import request from 'supertest';
import { OrderStatus } from '@energyweb/exchange-core';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { issueToken, MWh } from './utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('account ask order send', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let issuer: Contract;

    const user1Id = authenticatedUser.organization.id;
    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;
    const withdrawalAddress = ethers.Wallet.createRandom().address;

    const createDeposit = (address: string, amount = `${1000 * MWh}`, asset = dummyAsset) => {
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

    before(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            app,
            issuer
        } = await bootstrapTestInstance());
        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    let deposit: Transfer;
    let user1Address: string;
    const amount = `${1000 * MWh}`;

    beforeEach(async () => {
        await databaseService.truncate('order');
        await databaseService.truncate('transfer');

        ({ address: user1Address } = await accountService.getOrCreateAccount(user1Id));
        deposit = await createDeposit(user1Address);
    });

    it('should not be able to create ask order on unconfirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${100 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(403);
    });

    it('should be able to create ask order on confirmed deposit', async () => {
        await confirmDeposit();

        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${100 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201)
            .expect((res) => {
                const order = res.body as Order;

                expect(order.price).equals(100);
                expect(order.startVolume).equals(`${100 * MWh}`);
                expect(order.assetId).equals(deposit.asset.id);
                expect(new Date(order.product.generationFrom)).deep.equals(
                    dummyAsset.generationFrom
                );
                expect(new Date(order.product.generationTo)).deep.equals(dummyAsset.generationTo);
            });
    });

    it('should not be able to create ask order bigger than confirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1001 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(403);
    });

    it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1000 * MWh}`,
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
        const { generationFrom, generationTo } = dummyAsset;

        const certificateId = await issueToken(
            issuer,
            user1Address,
            amount,
            generationFrom.getTime(),
            generationTo.getTime()
        );
        const asset = {
            ...dummyAsset,
            tokenId: String(certificateId)
        };
        const txHash = '0x001';
        const dep = await transferService.createDeposit({
            address: user1Address,
            transactionHash: txHash,
            amount,
            asset
        });
        await transferService.setAsConfirmed(txHash, 10000);
        const withdrawal: RequestWithdrawalDTO = {
            assetId: dep.asset.id,
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

                expect(account.address).equals(user1Address);
                expect(account.balances.available.length).equals(0);
            });

        // wait to withdrawal to be finished to not mess with tx nonces
        await sleep(5000);
    });

    it('should be able to create and cancel bid', async () => {
        const volume = `${1000 * MWh}`;

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

                expect(order.price).equals(100);
                expect(order.startVolume).equals(volume);
                expect(order.status).equals(OrderStatus.Active);
            });

        await request(app.getHttpServer())
            .post(`/orders/${order.id}/cancel`)
            .expect(202)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).equals(order.id);
                expect(cancelled.status).equals(OrderStatus.PendingCancellation);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/orders/${order.id}`)
            .expect(200)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).equals(order.id);
                expect(cancelled.status).equals(OrderStatus.Cancelled);
            });
    });

    it('should not be able to create bid order with decimal volume', async () => {
        const volume = `${1.1 * MWh}`;

        const createBid: CreateBidDTO = {
            price: 100,
            validFrom: new Date(),
            volume,
            product: { deviceType: ['Solar'] }
        };

        await request(app.getHttpServer()).post('/orders/bid').send(createBid).expect(400);
    });

    it('should not be able to create ask order with decimal volume', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1.1 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer()).post('/orders/ask').send(createAsk).expect(400);
    });
});
