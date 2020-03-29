import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let app: INestApplication;
let transferService: TransferService;
let databaseService: DatabaseService;
let accountService: AccountService;
let demandService: DemandService;
let orderService: OrderService;
let productService: ProductService;

const dummyAsset = {
    address: '0x9876',
    tokenId: '0',
    deviceId: '0',
    generationFrom: new Date('2020-01-01'),
    generationTo: new Date('2020-01-31')
};

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

describe('Demand orders trading', () => {
    jest.setTimeout(10000);

    beforeAll(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            demandService,
            orderService,
            productService,
            app
        } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const demandOwner = '1';
    const sellerId = '2';

    it('should trade the bid from the demand', async () => {
        const validFrom = new Date();
        const { address } = await accountService.getOrCreateAccount(sellerId);

        const deposit = await createDeposit(address);
        await confirmDeposit();

        await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: '500',
            price: 1000,
            validFrom: validFrom.toISOString()
        });

        const product = await productService.getProduct(deposit.asset.id);

        const demand = await demandService.createSingle(
            demandOwner,
            1000,
            '250',
            product,
            validFrom
        );

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/trade`)
            .expect(200)
            .expect(res => {
                const trades = res.body as TradeDTO[];

                expect(trades).toBeDefined();
                expect(trades).toHaveLength(1);
                expect(trades[0].askId).toBeUndefined(); // as a buyer, I should not see the askId
                expect(trades[0].bidId).toBe(demand.bids[0].id);
            });

        await request(app.getHttpServer())
            .get(`/orders`)
            .expect(200)
            .expect(res => {
                const orders = res.body as Order[];

                expect(orders).toBeDefined();
                expect(orders).toHaveLength(1);
                expect(orders[0].demandId).toBe(demand.id);
            });
    });
});
