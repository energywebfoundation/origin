import { IRECDeviceService } from '@energyweb/utils-general';
import { assert } from 'chai';

import { Matching } from '../Matching';
import { Order, OrderStatus } from '../Order';
import { Trade } from '../Trade';
import { Product } from '../Product';

interface IOrderCreationArgs {
    product?: Product;
    price?: number;
    volume?: number;
}

describe('Matching tests', () => {
    const deviceService = new IRECDeviceService();

    const defaultPrice = 2;
    const defaultVolume = 100;
    const solarSpecific = deviceService.encode([['Solar', 'Photovoltaic', 'Classic silicon']]);

    let initialOrderId = 0;

    const createAsk = (args?: IOrderCreationArgs) => {
        return Order.createAsk(
            (initialOrderId++).toString(),
            args?.price || defaultPrice,
            args?.volume || defaultVolume,
            args?.product || { assetType: solarSpecific },
            0
        );
    };

    const createBid = (args?: IOrderCreationArgs) => {
        return Order.createBid(
            (initialOrderId++).toString(),
            args?.price || defaultPrice,
            args?.volume || defaultVolume,
            args?.product || { assetType: solarSpecific },
            0
        );
    };

    const assertTrade = (trade: Trade, bid: Order, ask: Order, volume?: number, price?: number) => {
        assert.equal(trade.askId, ask.id);
        assert.equal(trade.bidId, bid.id);
        assert.equal(trade.volume, volume || defaultVolume);
        assert.equal(trade.price, price || defaultPrice);
    };

    const assertOrderBook = (askSize: number, bidSize: number, matchingEngine: Matching) => {
        const { asks, bids } = matchingEngine.orderBook();
        assert.equal(asks.size, askSize);
        assert.equal(bids.size, bidSize);
    };

    describe('price and volume matching', () => {
        it('should trade', done => {
            const matchingEngine = new Matching();

            const ask = createAsk();
            const bid = createBid();

            matchingEngine.submitOrder(ask);
            matchingEngine.submitOrder(bid);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 1);

                const trade = res.first<Trade>();
                assertTrade(trade, bid, ask);

                assertOrderBook(0, 0, matchingEngine);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);

        it('should not trade', done => {
            const matchingEngine = new Matching();

            const ask = createAsk();
            const bid = createBid({ price: defaultPrice - 1 });

            matchingEngine.submitOrder(ask);
            matchingEngine.submitOrder(bid);

            matchingEngine.trades.subscribe(res => {
                assert.fail(res.size, 0, 'not expecting any trades');
            });

            matchingEngine.tick();

            assertOrderBook(1, 1, matchingEngine);

            done();
        }).timeout(1000);

        it('should trade at ask price', done => {
            const matchingEngine = new Matching();

            const ask = createAsk();
            const bid = createBid({ price: defaultPrice + 1 });

            matchingEngine.submitOrder(ask);
            matchingEngine.submitOrder(bid);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 1);

                const trade = res.first<Trade>();
                assertTrade(trade, bid, ask);

                assertOrderBook(0, 0, matchingEngine);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid', done => {
            const matchingEngine = new Matching();

            const ask1 = createAsk();
            const ask2 = createAsk();

            const bid = createBid({ volume: defaultVolume * 2 });

            matchingEngine.submitOrder(ask1);
            matchingEngine.submitOrder(ask2);
            matchingEngine.submitOrder(bid);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 2);

                const trade1 = res.get<Trade>(0, null);
                assertTrade(trade1, bid, ask1);

                const trade2 = res.get<Trade>(1, null);
                assertTrade(trade2, bid, ask2);

                assertOrderBook(0, 0, matchingEngine);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);

        it('should return 2 trades and fill all orders when having submitted 1 asks and 2 bids', done => {
            const matchingEngine = new Matching();

            const ask = createAsk({ volume: defaultVolume * 2 });
            const bid1 = createBid();
            const bid2 = createBid();

            matchingEngine.submitOrder(ask);
            matchingEngine.submitOrder(bid1);
            matchingEngine.submitOrder(bid2);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 2);

                const trade1 = res.get<Trade>(0, null);
                assertTrade(trade1, bid1, ask);

                const trade2 = res.get<Trade>(1, null);
                assertTrade(trade2, bid2, ask);

                assertOrderBook(0, 0, matchingEngine);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            const matchingEngine = new Matching();

            const ask = createAsk({ volume: defaultVolume * 2 });
            const bid1 = createBid({ volume: defaultVolume });
            const bid2 = createBid({ volume: defaultVolume * 2 });

            matchingEngine.submitOrder(ask);
            matchingEngine.submitOrder(bid1);
            matchingEngine.submitOrder(bid2);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 2);

                const trade1 = res.get<Trade>(0, null);
                assertTrade(trade1, bid1, ask);

                const trade2 = res.get<Trade>(1, null);
                assertTrade(trade2, bid2, ask);

                assertOrderBook(0, 1, matchingEngine);

                const partiallyFilledBid = matchingEngine.orderBook().bids.first<Order>();
                assert.equal(partiallyFilledBid.status, OrderStatus.PartiallyFilled);
                assert.equal(partiallyFilledBid.volume, defaultVolume);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            const matchingEngine = new Matching();
            const expectedTradeVolume = defaultVolume * 2;

            const ask1 = createAsk({ volume: expectedTradeVolume });
            const ask2 = createAsk({ volume: expectedTradeVolume, price: defaultPrice * 2 });
            const bid1 = createBid();
            const bid2 = createBid({ volume: expectedTradeVolume, price: defaultPrice * 2 });

            matchingEngine.submitOrder(ask1);
            matchingEngine.submitOrder(ask2);
            matchingEngine.submitOrder(bid1);
            matchingEngine.submitOrder(bid2);

            matchingEngine.trades.subscribe(res => {
                assert.equal(res.size, 1);

                const trade1 = res.get<Trade>(0, null);
                assertTrade(trade1, bid2, ask1, expectedTradeVolume);

                assertOrderBook(1, 1, matchingEngine);

                done();
            });

            matchingEngine.tick();
        }).timeout(60000);
    });
});
