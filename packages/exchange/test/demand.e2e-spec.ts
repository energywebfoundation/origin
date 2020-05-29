import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { INestApplication } from '@nestjs/common';
import moment from 'moment';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { CreateDemandDTO } from '../src/pods/demand/create-demand.dto';
import { Demand } from '../src/pods/demand/demand.entity';
import { DemandService } from '../src/pods/demand/demand.service';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance, authenticatedUser } from './exchange';
import { OrderStatus } from '../src/pods/order/order-status.enum';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    beforeEach(async () => {
        await databaseService.truncate('order');
        await databaseService.truncate('transfer');
        await databaseService.truncate('demand');
    });

    const demandOwner = authenticatedUser.organization;
    const sellerId = '2';
    const price = 1000;

    const createDemandWith2Bids: CreateDemandDTO = {
        price: 100,
        periodTimeFrame: TimeFrame.monthly,
        start: moment().toDate(),
        end: moment().add(2, 'month').toDate(),
        product: { deviceType: ['Solar'] },
        volumePerPeriod: '250',
        boundToGenerationTime: false
    };

    it('should trade the bid from the demand', async () => {
        const validFrom = new Date();
        const { address } = await accountService.getOrCreateAccount(sellerId);

        const deposit = await createDeposit(address);
        await confirmDeposit();

        await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: '500',
            price,
            validFrom
        });

        const product = await productService.getProduct(deposit.asset.id);
        const createDemand: CreateDemandDTO = {
            price,
            periodTimeFrame: TimeFrame.monthly,
            start: moment().toDate(),
            end: moment().add(1, 'month').toDate(),
            product,
            volumePerPeriod: '250',
            boundToGenerationTime: false
        };

        const demand = await demandService.create(demandOwner, createDemand);

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/trade`)
            .expect(200)
            .expect((res) => {
                const trades = res.body as TradeDTO[];

                expect(trades).toBeDefined();
                expect(trades).toHaveLength(1);
                expect(trades[0].askId).toBeUndefined(); // as a buyer, I should not see the askId
                expect(trades[0].bidId).toBe(demand.bids[0].id);
            });

        await request(app.getHttpServer())
            .get(`/orders`)
            .expect(200)
            .expect((res) => {
                const orders = res.body as Order[];

                expect(orders).toBeDefined();
                expect(orders).toHaveLength(1);
                expect(orders[0].demandId).toBe(demand.id);
            });
    });

    it('should be able to create demand', async () => {
        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(201)
            .expect((res) => {
                const created = res.body as Demand;

                const [bid1, bid2] = created.bids;

                expect(created.price).toBe(createDemandWith2Bids.price);
                expect(created.bids).toHaveLength(2);

                expect(bid1.price).toBe(createDemandWith2Bids.price);
                expect(bid2.price).toBe(createDemandWith2Bids.price);

                expect(bid1.demandId).toBe(created.id);
                expect(bid2.demandId).toBe(created.id);
            });
    });

    it('should be able to cancel demand', async () => {
        let demandId: string;

        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(201)
            .expect((res) => {
                demandId = (res.body as Demand).id;
            });

        await request(app.getHttpServer())
            .post(`/demand/${demandId}/pause`)
            .expect(202)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).toBe(demandId);
                expect(demand.status).toBe(DemandStatus.PAUSED);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).toBe(OrderStatus.PendingCancellation);
                expect(bid2.status).toBe(OrderStatus.PendingCancellation);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/demand/${demandId}`)
            .expect(200)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).toBe(demandId);
                expect(demand.status).toBe(DemandStatus.PAUSED);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).toBe(OrderStatus.Cancelled);
                expect(bid2.status).toBe(OrderStatus.Cancelled);
            });
    });

    it('should be able to resume paused demand', async () => {
        let demandId: string;

        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(201)
            .expect((res) => {
                demandId = (res.body as Demand).id;
            });

        await request(app.getHttpServer()).post(`/demand/${demandId}/pause`).expect(202);

        await sleep(3000);

        await request(app.getHttpServer())
            .post(`/demand/${demandId}/resume`)
            .expect(202)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).toBe(demandId);
                expect(demand.status).toBe(DemandStatus.ACTIVE);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/demand/${demandId}`)
            .expect(200)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).toBe(demandId);
                expect(demand.status).toBe(DemandStatus.ACTIVE);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).toBe(OrderStatus.Active);
                expect(bid2.status).toBe(OrderStatus.Active);
            });
    });
});
