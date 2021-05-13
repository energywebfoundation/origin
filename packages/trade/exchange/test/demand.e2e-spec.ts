/* eslint-disable no-unused-expressions */
import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';
import { OrderStatus } from '@energyweb/exchange-core';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountService } from '../src/pods/account/account.service';
import { CreateDemandDTO } from '../src/pods/demand/create-demand.dto';
import { Demand } from '../src/pods/demand/demand.entity';
import { DemandService } from '../src/pods/demand/demand.service';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { createDepositAddress, MWh } from './utils';
import { DemandSummaryDTO } from '../src/pods/demand/demand-summary.dto';
import { DB_TABLE_PREFIX } from '../src/utils/tablePrefix';
import { TestProduct } from './product/get-product.handler';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let app: INestApplication;
let transferService: TransferService;
let databaseService: DatabaseService;
let accountService: AccountService;
let demandService: DemandService<string>;
let orderService: OrderService<string>;

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

describe('Demand orders trading', () => {
    before(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            demandService,
            orderService,
            app
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    beforeEach(async () => {
        await databaseService.truncate(
            `${DB_TABLE_PREFIX}_order`,
            `${DB_TABLE_PREFIX}_transfer`,
            `${DB_TABLE_PREFIX}_demand`
        );
    });

    const demandOwner = authenticatedUser.organization.id;
    const sellerId = '2';
    const price = 1000;

    const createDemandWith2Bids: CreateDemandDTO<string> = {
        price: 100,
        periodTimeFrame: TimeFrame.Monthly,
        start: moment().toDate(),
        end: moment().add(2, 'month').toDate(),
        product: "{ deviceType: ['Solar'] }",
        volumePerPeriod: `${250 * MWh}`,
        boundToGenerationTime: false,
        excludeEnd: true
    };

    it('should trade the bid from the demand', async () => {
        const validFrom = new Date();
        const address = await createDepositAddress(accountService, sellerId);

        const deposit = await createDeposit(address);
        await confirmDeposit();

        await orderService.createAsk(sellerId, {
            assetId: deposit.asset.id,
            volume: `${500 * MWh}`,
            price,
            validFrom
        });

        const createDemand: CreateDemandDTO<string> = {
            price,
            periodTimeFrame: TimeFrame.Monthly,
            start: moment().toDate(),
            end: moment().add(1, 'month').toDate(),
            product: TestProduct,
            volumePerPeriod: `${250 * MWh}`,
            boundToGenerationTime: false,
            excludeEnd: true
        };

        const demand = await demandService.create(demandOwner, createDemand);

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/trade`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trades = res.body as TradeDTO<string>[];

                expect(trades).to.have.length(1);
                expect(trades[0].askId).to.be.undefined; // as a buyer, I should not see the askId
                expect(trades[0].bidId).equals(demand.bids[0].id);
            });

        await request(app.getHttpServer())
            .get(`/orders`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const orders = res.body as Order[];

                expect(orders).to.have.length(1);
                expect(orders[0].demandId).equals(demand.id);
            });
    });

    it('should be able to create demand', async () => {
        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                const created = res.body as Demand;

                const [bid1, bid2] = created.bids;

                expect(created.price).equals(createDemandWith2Bids.price);
                expect(created.bids).to.have.length(2);

                expect(bid1.price).equals(createDemandWith2Bids.price);
                expect(bid2.price).equals(createDemandWith2Bids.price);

                expect(bid1.demandId).equals(created.id);
                expect(bid2.demandId).equals(created.id);
            });
    });

    it('should be able to get the summary of demand to create', async () => {
        await request(app.getHttpServer())
            .post(`/demand/summary`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const summary = res.body as DemandSummaryDTO<string>;

                const [bid1, bid2] = summary.bids;

                expect(summary.bids).to.have.length(2);

                expect(bid1.price).equals(createDemandWith2Bids.price);
                expect(bid2.price).equals(createDemandWith2Bids.price);

                expect(summary.volume).equals(`${500 * MWh}`);
            });
    });

    it('should be able to cancel demand', async () => {
        let demandId: string;

        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                demandId = (res.body as Demand).id;
            });

        await request(app.getHttpServer())
            .post(`/demand/${demandId}/pause`)
            .expect(HttpStatus.ACCEPTED)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).equals(demandId);
                expect(demand.status).equals(DemandStatus.PAUSED);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).equals(OrderStatus.PendingCancellation);
                expect(bid2.status).equals(OrderStatus.PendingCancellation);
            });

        await sleep(5000);

        await request(app.getHttpServer())
            .get(`/demand/${demandId}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).equals(demandId);
                expect(demand.status).equals(DemandStatus.PAUSED);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).equals(OrderStatus.Cancelled);
                expect(bid2.status).equals(OrderStatus.Cancelled);
            });
    });

    it('should not be able to cancel individual orders from demand', async () => {
        const demand = await demandService.create(demandOwner, createDemandWith2Bids);
        const [bid] = demand.bids;

        await request(app.getHttpServer())
            .post(`/orders/${bid.id}/cancel`)
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should be able to resume paused demand', async () => {
        let demandId: string;

        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                demandId = (res.body as Demand).id;
            });

        await request(app.getHttpServer())
            .post(`/demand/${demandId}/pause`)
            .expect(HttpStatus.ACCEPTED);

        await sleep(3000);

        await request(app.getHttpServer())
            .post(`/demand/${demandId}/resume`)
            .expect(HttpStatus.ACCEPTED)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).equals(demandId);
                expect(demand.status).equals(DemandStatus.ACTIVE);
            });

        await sleep(3000);

        await request(app.getHttpServer())
            .get(`/demand/${demandId}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const demand = res.body as Demand;

                expect(demand.id).equals(demandId);
                expect(demand.status).equals(DemandStatus.ACTIVE);

                const [bid1, bid2] = demand.bids;

                expect(bid1.status).equals(OrderStatus.Active);
                expect(bid2.status).equals(OrderStatus.Active);
            });
    });

    it('should not be able to create demand with decimal volume', async () => {
        const demand: CreateDemandDTO<string> = {
            price: 100,
            periodTimeFrame: TimeFrame.Monthly,
            start: moment().toDate(),
            end: moment().add(2, 'month').toDate(),
            product: "{ deviceType: ['Solar'] }",
            volumePerPeriod: `${2.5 * MWh}`,
            boundToGenerationTime: false,
            excludeEnd: true
        };

        await request(app.getHttpServer())
            .post(`/demand`)
            .send(demand)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should allow you to replace your demand with new one', async () => {
        let demandId: string;
        await request(app.getHttpServer())
            .post(`/demand`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                ({ id: demandId } = res.body as Demand);
            });

        let newDemandId: string;
        await request(app.getHttpServer())
            .post(`/demand/${demandId}/replace`)
            .send(createDemandWith2Bids)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                ({ id: newDemandId } = res.body as Demand);
            });

        await request(app.getHttpServer())
            .get(`/demand/${demandId}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const { status } = res.body as Demand;

                expect(status).to.be.equal(DemandStatus.ARCHIVED);
            });

        await request(app.getHttpServer())
            .get(`/demand/${newDemandId}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const { status } = res.body as Demand;

                expect(status).to.be.equal(DemandStatus.ACTIVE);
            });
    });
});
