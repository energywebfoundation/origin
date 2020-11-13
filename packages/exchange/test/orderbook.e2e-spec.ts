import { Filter } from '@energyweb/exchange-core';

import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import moment from 'moment';
import request from 'supertest';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAssetDTO } from '../src/pods/asset/asset.entity';
import { OrderBookOrderDTO } from '../src/pods/order-book/order-book-order.dto';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { OrderService } from '../src/pods/order/order.service';
import { TradePriceInfoDTO } from '../src/pods/trade/trade-price-info.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { IExternalDeviceService, IProductInfo } from '../src/interfaces';
import { ProductFilterDTO } from '../src/pods/order-book/product-filter.dto';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type OrderBook = {
    asks: OrderBookOrderDTO[];
    bids: OrderBookOrderDTO[];
    lastTradedPrice: TradePriceInfoDTO;
};

describe('orderbook tests', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let orderService: OrderService;
    let accountService: AccountService;

    const user1Id = authenticatedUser.organization.id;
    const user2Id = '2';

    const solarAsset: CreateAssetDTO = {
        address: '0x9876',
        tokenId: '0',
        deviceId: 'deviceId1',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const windAsset: CreateAssetDTO = {
        address: '0x9876',
        tokenId: '1',
        deviceId: 'deviceId2',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const marineAsset: CreateAssetDTO = {
        address: '0x9876',
        tokenId: '2',
        deviceId: 'deviceId3',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const createDeposit = async (address: string, amount = '1000', asset: CreateAssetDTO) => {
        const deposit = await transferService.createDeposit({
            address,
            transactionHash: `0x${((Math.random() * 0xffffff) << 0).toString(16)}`,
            amount,
            asset
        });

        await transferService.setAsConfirmed(deposit.transactionHash, 10000);

        return deposit;
    };

    const createAsks = async (address: string) => {
        const deposit = await createDeposit(address, '1000', solarAsset);

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
    };

    const createBids = async () => {
        const createBid1: CreateBidDTO = {
            price: 50,
            volume: '100',
            validFrom: new Date(),
            product: {
                deviceType: ['Wind'],
                generationFrom: moment().startOf('month').toISOString(),
                generationTo: moment().startOf('month').add(1, 'month').toISOString()
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
    };

    let windTradeLastTradePrice: {
        price: number;
        assetId: string;
    };

    const createWindTrades = async (address: string) => {
        const deposit = await createDeposit(address, '1000', windAsset);

        const createAsk1: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '500',
            price: 1000,
            validFrom: new Date()
        };
        const createAsk2: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '500',
            price: 1100,
            validFrom: new Date()
        };

        await orderService.createAsk(user1Id, createAsk1);
        await orderService.createAsk(user1Id, createAsk2);

        const createBid1: CreateBidDTO = {
            price: 1200,
            volume: '500',
            validFrom: new Date(),
            product: {
                deviceType: ['Wind']
            }
        };

        await orderService.createBid(user2Id, createBid1);
        await orderService.createBid(user2Id, createBid1);

        windTradeLastTradePrice = {
            price: 1100,
            assetId: deposit.asset.id
        };
    };

    let marineTradeLastTradePrice: {
        price: number;
        assetId: string;
    };

    const createMarineTrades = async (address: string) => {
        const deposit = await createDeposit(address, '1000', marineAsset);

        const createAsk1: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '500',
            price: 3000,
            validFrom: new Date()
        };

        await orderService.createAsk(user1Id, createAsk1);

        const createBid1: CreateBidDTO = {
            price: 3000,
            volume: '500',
            validFrom: new Date(),
            product: {
                deviceType: ['Marine']
            }
        };

        await orderService.createBid(user2Id, createBid1);

        marineTradeLastTradePrice = {
            price: 3000,
            assetId: deposit.asset.id
        };
    };

    const createTrades = async (address: string) => {
        await createWindTrades(address);
        await sleep(2000);

        await createMarineTrades(address);
        await sleep(2000);
    };

    const productByDeviceId = new Map<string, IProductInfo>([
        [
            'deviceId1',
            {
                deviceType: 'Solar;Photovoltaic;Classic silicon',
                country: 'Thailand',
                region: 'Central',
                province: 'Nakhon Pathom',
                operationalSince: 2016,
                gridOperator: 'TH-PEA'
            }
        ],
        [
            'deviceId2',
            {
                deviceType: 'Wind;Onshore',
                country: 'Thailand',
                region: 'Central',
                province: 'Nakhon Pathom',
                operationalSince: 2016,
                gridOperator: 'TH-PEA'
            }
        ],
        [
            'deviceId3',
            {
                deviceType: 'Marine;Tidal;Offshore',
                country: 'Thailand',
                region: 'Central',
                province: 'Nakhon Pathom',
                operationalSince: 2016,
                gridOperator: 'TH-PEA'
            }
        ]
    ]);

    const deviceServiceMock = ({
        getDeviceProductInfo: async ({ id }: IExternalDeviceId): Promise<IProductInfo> => {
            return productByDeviceId.get(id);
        }
    } as unknown) as IExternalDeviceService;

    before(async () => {
        ({
            transferService,
            orderService,
            databaseService,
            accountService,
            app
        } = await bootstrapTestInstance(deviceServiceMock));

        await app.init();

        const { address } = await accountService.getOrCreateAccount(user1Id);
        await createTrades(address);

        await createAsks(address);
        await createBids();

        await sleep(2000);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const defaultAllFilter = {
        deviceVintageFilter: Filter.All,
        generationTimeFilter: Filter.All,
        locationFilter: Filter.All,
        deviceTypeFilter: Filter.All,
        gridOperatorFilter: Filter.All
    };

    [
        { ...defaultAllFilter, deviceTypeFilter: Filter.Specific },
        { ...defaultAllFilter, deviceVintageFilter: Filter.Specific },
        {
            ...defaultAllFilter,
            generationTimeFilter: Filter.Specific,
            generationFrom: new Date().toISOString()
        },
        { ...defaultAllFilter, deviceTypeFilter: Filter.Specific, deviceType: ['LOL'] },
        {
            ...defaultAllFilter,
            deviceVintageFilter: ('LOL' as unknown) as Filter
        }
    ].forEach((params: ProductFilterDTO): void => {
        it(`should return 400 when filter is invalid: ${JSON.stringify(params)}`, async () => {
            await request(app.getHttpServer())
                .post('/orderbook/search')
                .send(params)
                .expect('Content-Type', /application\/json/)
                .expect(400);
        });
    });

    it('should return all orders', async () => {
        const {
            body: { asks, bids }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(2);
        expect(bids).to.have.length(2);
    });

    it('should return orders filtered by default filter', async () => {
        const {
            body: { asks, bids, lastTradedPrice }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .send(defaultAllFilter)
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(2);
        expect(bids).to.have.length(2);
        expect(lastTradedPrice.price).equals(marineTradeLastTradePrice.price); // marine asset trade
        expect(lastTradedPrice.assetId).equals(marineTradeLastTradePrice.assetId); // marine asset trade
    });

    it('should return orders filtered by device type (Solar)', async () => {
        const {
            body: { asks, bids }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                ...defaultAllFilter,
                deviceTypeFilter: Filter.Specific,
                deviceType: ['Solar']
            })
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(2);
        expect(bids).to.have.length(1);
    });

    it('should return orders filtered by device type (Wind)', async () => {
        const {
            body: { asks, bids, lastTradedPrice }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                ...defaultAllFilter,
                deviceTypeFilter: Filter.Specific,
                deviceType: ['Wind']
            })
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(0);
        expect(bids).to.have.length(1);
        expect(lastTradedPrice.price).equals(windTradeLastTradePrice.price);
        expect(lastTradedPrice.assetId).equals(windTradeLastTradePrice.assetId);
    });

    it('should return orders filtered by generation date', async () => {
        const {
            body: { asks, bids }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                ...defaultAllFilter,
                generationTimeFilter: Filter.Specific,
                generationFrom: moment().startOf('month').toISOString(),
                generationTo: moment().startOf('month').add(1, 'month').toISOString()
            })
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(0);
        expect(bids).to.have.length(1);
        expect(bids[0].product.deviceType).to.deep.equal(['Wind']);
    });

    it('should return empty orders list if time mismatch', async () => {
        const {
            body: { asks, bids }
        }: { body: OrderBook } = await request(app.getHttpServer())
            .post('/orderbook/search')
            .send({
                ...defaultAllFilter,
                generationTimeFilter: Filter.Specific,
                generationFrom: moment().startOf('month').add(2, 'hours').toISOString(),
                generationTo: moment()
                    .startOf('month')
                    .add(1, 'month')
                    .add(2, 'hours')
                    .toISOString()
            })
            .expect('Content-Type', /application\/json/)
            .expect(200);

        expect(asks).to.have.length(0);
        expect(bids).to.have.length(0);
    });
});
