import { OrderStatus } from '@energyweb/exchange-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { Order } from '../src/pods/order/order.entity';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DB_TABLE_PREFIX } from '../src/utils/tablePrefix';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { OrderDTO } from './order/order.dto';
import { TestProduct } from './product/get-product.handler';
import { createDepositAddress, MWh } from './utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('account ask order send', () => {
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

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (
        address: string,
        amount = `${1000 * MWh}`,
        asset = dummyAsset,
        blockNumber = 123456
    ) => {
        return transferService.createDeposit({
            address,
            transactionHash,
            amount,
            blockNumber,
            asset
        });
    };

    const confirmDeposit = () => {
        return transferService.setAsConfirmed(transactionHash, 10000);
    };

    before(async () => {
        ({ transferService, accountService, databaseService, app } = await bootstrapTestInstance());
        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    let deposit: Transfer;
    let user1Address: string;

    beforeEach(async () => {
        await databaseService.truncate(`${DB_TABLE_PREFIX}_order`, `${DB_TABLE_PREFIX}_transfer`);

        user1Address = await createDepositAddress(accountService, user1Id);
        deposit = await createDeposit(user1Address);
    });

    it('should not be able to create ask order on unconfirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${100 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(HttpStatus.FORBIDDEN);
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
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                const order = res.body as OrderDTO;

                expect(order.price).equals(100);
                expect(order.startVolume).equals(`${100 * MWh}`);
                expect(order.assetId).equals(deposit.asset.id);
                expect(order.product).equals(TestProduct);
            });
    });

    it('should not be able to create ask order bigger than confirmed deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1001 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1000 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await confirmDeposit();

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should be able to create and cancel bid', async () => {
        const volume = `${1000 * MWh}`;

        const createBid: CreateBidDTO<string> = {
            price: 100,
            validFrom: new Date(),
            volume,
            product: TestProduct
        };

        let order: OrderDTO;

        await request(app.getHttpServer())
            .post('/orders/bid')
            .send(createBid)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                order = res.body as OrderDTO;

                expect(order.price).equals(100);
                expect(order.startVolume).equals(volume);
                expect(order.status).equals(OrderStatus.Active);
            });

        await request(app.getHttpServer())
            .post(`/orders/${order.id}/cancel`)
            .expect(HttpStatus.ACCEPTED)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).equals(order.id);
                expect(cancelled.status).equals(OrderStatus.PendingCancellation);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/orders/${order.id}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const cancelled = res.body as Order;

                expect(cancelled.id).equals(order.id);
                expect(cancelled.status).equals(OrderStatus.Cancelled);
            });
    });

    it('should not be able to create bid order with decimal volume', async () => {
        const volume = `${1.1 * MWh}`;

        const createBid: CreateBidDTO<string> = {
            price: 100,
            validFrom: new Date(),
            volume,
            product: "{ deviceType: ['Solar'] }"
        };

        await request(app.getHttpServer())
            .post('/orders/bid')
            .send(createBid)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not be able to create ask order with decimal volume', async () => {
        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1.1 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not allow to post more asks than deposits', async () => {
        await confirmDeposit();

        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: `${1000 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        for (let i = 0; i < 10; i++) {
            request(app.getHttpServer())
                .post('/orders/ask')
                .send(createAsk)
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .end(() => {});
        }

        await sleep(3000);

        await request(app.getHttpServer())
            .get('/orders')
            .expect((res) => {
                const orders = res.body as Order[];

                expect(orders).to.have.length(1);
            });
    });
});
