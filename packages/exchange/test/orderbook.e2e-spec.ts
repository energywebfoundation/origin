import { Filter } from '@energyweb/exchange-core';
import { INestApplication } from '@nestjs/common';
import moment from 'moment';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { OrderBookOrderDTO } from '../src/pods/order-book/order-book-order.dto';
import { ProductFilterDTO } from '../src/pods/order-book/product-filter.dto';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { OrderService } from '../src/pods/order/order.service';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('orderbook tests', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let orderService: OrderService;
    let accountService: AccountService;

    const user1Id = '1';
    const user2Id = '2';

    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    let user1Address: string;
    let deposit: Transfer;

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
        ({
            transferService,
            orderService,
            databaseService,
            accountService,
            app
        } = await bootstrapTestInstance());

        await app.init();

        ({ address: user1Address } = await accountService.getOrCreateAccount(user1Id));
        deposit = await createDeposit(user1Address);
        await confirmDeposit();
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should return orders based on the filter', async () => {
        const createAsk1: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date()
        };

        const createAsk2: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 150,
            validFrom: new Date()
        };

        await orderService.createAsk(user1Id, createAsk1);
        await orderService.createAsk(user1Id, createAsk2);

        const createBid1: CreateBidDTO = {
            price: 50,
            volume: '100',
            validFrom: new Date(),
            product: {
                deviceType: ['Wind'],
                generationFrom: moment()
                    .startOf('month')
                    .toISOString(),
                generationTo: moment()
                    .startOf('month')
                    .add(1, 'month')
                    .toISOString()
            }
        };

        const createBid2: CreateBidDTO = {
            price: 60,
            volume: '100',
            validFrom: new Date(),
            product: { deviceType: ['Solar'] }
        };

        await orderService.createBid(user2Id, createBid1);
        await orderService.createBid(user2Id, createBid2);

        await sleep(2000);

        await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                deviceVintageFilter: Filter.All,
                generationTimeFilter: Filter.All,
                locationFilter: Filter.All,
                deviceTypeFilter: Filter.All
            } as ProductFilterDTO)
            .expect(200)
            .expect(res => {
                console.log(res.body);
                const { asks, bids } = res.body as {
                    asks: OrderBookOrderDTO[];
                    bids: OrderBookOrderDTO[];
                };

                expect(asks).toHaveLength(2);
                expect(bids).toHaveLength(2);
            });

        await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                deviceVintageFilter: Filter.All,
                generationTimeFilter: Filter.All,
                locationFilter: Filter.All,
                deviceTypeFilter: Filter.Specific,
                deviceType: ['Solar']
            } as ProductFilterDTO)
            .expect(200)
            .expect(res => {
                const { asks, bids } = res.body as {
                    asks: OrderBookOrderDTO[];
                    bids: OrderBookOrderDTO[];
                };

                expect(asks).toHaveLength(2);
                expect(bids).toHaveLength(1);
            });
    });
});
