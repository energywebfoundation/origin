import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountService } from '../src/pods/account/account.service';
import { DirectBuyDTO } from '../src/pods/order/direct-buy.dto';
import { OrderType } from '../src/pods/order/order-type.enum';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { bootstrapTestInstance } from './exchange';
import { MWh } from './utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('DirectBuy orders tests', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let orderService: OrderService;

    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (address: string, amount = `${1000 * MWh}`, asset = dummyAsset) => {
        return transferService.createDeposit({
            address,
            transactionHash,
            amount,
            asset
        });
    };

    before(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            orderService,
            app
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should allow to buy a selected ask', async () => {
        const validFrom = new Date();
        const sellerId = '2';
        const { address } = await accountService.getOrCreateAccount(sellerId);

        const deposit = await createDeposit(address);
        await transferService.setAsConfirmed(transactionHash, 10000);

        await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: `${500 * MWh}`,
            price: 1000,
            validFrom
        });

        const ask2 = await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: `${500 * MWh}`,
            price: 2000,
            validFrom
        });

        const directBuyOrder: DirectBuyDTO = {
            askId: ask2.id,
            price: ask2.price,
            volume: ask2.startVolume.toString(10)
        };

        let createdDirectBuyOrder: Order;

        await request(app.getHttpServer())
            .post('/orders/ask/buy')
            .send(directBuyOrder)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                createdDirectBuyOrder = res.body as Order;

                expect(createdDirectBuyOrder.type).equals(OrderType.Direct);
                expect(createdDirectBuyOrder.price).equals(directBuyOrder.price);
                expect(createdDirectBuyOrder.startVolume).equals(directBuyOrder.volume);
            });

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/trade`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trades = res.body as TradeDTO[];
                const [trade] = trades;

                expect(trades).to.have.length(1);
                expect(trade.bidId).equals(createdDirectBuyOrder.id);
                expect(trade.volume).equals(createdDirectBuyOrder.startVolume);
            });
    });
});
