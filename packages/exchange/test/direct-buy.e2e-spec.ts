import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { DirectBuyDTO } from '../src/pods/order/direct-buy.dto';
import { OrderType } from '../src/pods/order/order-type.enum';
import { OrderDTO } from '../src/pods/order/order.dto';
import { OrderService } from '../src/pods/order/order.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('DirectBuy orders tests', () => {
    jest.setTimeout(10000);

    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let orderService: OrderService;

    const dummyAsset = { address: '0x9876', tokenId: '0', deviceId: '0' };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

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
            accountService,
            databaseService,
            orderService,
            app
        } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should allow to buy a selected ask', async () => {
        const validFrom = new Date();
        const sellerId = '2';
        const { address } = await accountService.getOrCreateAccount(sellerId);
        const deposit = await createDeposit(address);
        await confirmDeposit();

        await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: '500',
            price: 1000,
            validFrom: validFrom.toISOString()
        });

        const ask2 = await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: '500',
            price: 2000,
            validFrom: validFrom.toISOString()
        });

        const directBuyOrder: DirectBuyDTO = {
            askId: ask2.id,
            price: ask2.price,
            volume: ask2.startVolume.toString(10)
        };

        let createdDirectBuyOrder: OrderDTO;

        await request(app.getHttpServer())
            .post('/orders/ask/buy')
            .send(directBuyOrder)
            .expect(201)
            .expect(res => {
                createdDirectBuyOrder = res.body as OrderDTO;

                expect(createdDirectBuyOrder.type).toBe(OrderType.Direct);
                expect(createdDirectBuyOrder.price).toBe(directBuyOrder.price);
                expect(createdDirectBuyOrder.startVolume).toBe(directBuyOrder.volume);
            });

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/trade`)
            .expect(200)
            .expect(res => {
                const trades = res.body as TradeDTO[];
                const [trade] = trades;

                expect(trades).toBeDefined();
                expect(trades).toHaveLength(1);
                expect(trade.bidId).toBe(createdDirectBuyOrder.id);
                expect(trade.volume).toBe(createdDirectBuyOrder.startVolume);
            });
    });
});
