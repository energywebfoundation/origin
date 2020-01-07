import { assert } from 'chai';

import { Matching } from '../Matching';
import { Order, OrderSide, OrderStatus } from '../Order';
import { Trade } from '../Trade';

describe('Matching tests', () => {
    const assertTrade = (trade: Trade, bid: Order, ask: Order, volume: number, price: number) => {
        assert.equal(trade.askId, ask.id);
        assert.equal(trade.bidId, bid.id);
        assert.equal(trade.volume, volume);
        assert.equal(trade.price, price);
    };

    const assertOrderBook = (askSize: number, bidSize: number, matchingEngine: Matching) => {
        const { asks, bids } = matchingEngine.orderBook();
        assert.equal(asks.size, askSize);
        assert.equal(bids.size, bidSize);
    };

    it('should trade', done => {
        const matchingEngine = new Matching();

        const ask = { id: '1', side: OrderSide.Ask, price: 1, volume: 100 } as Order;
        const bid = { id: '2', side: OrderSide.Bid, price: 1, volume: 100 } as Order;

        matchingEngine.submitOrder(ask);
        matchingEngine.submitOrder(bid);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 1);

            const trade = res.first<Trade>();
            assertTrade(trade, bid, ask, 100, 1);

            assertOrderBook(0, 0, matchingEngine);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);

    it('should not trade', done => {
        const matchingEngine = new Matching();

        const ask = { id: '1', side: OrderSide.Ask, price: 2, volume: 100 } as Order;
        const bid = { id: '2', side: OrderSide.Bid, price: 1, volume: 100 } as Order;

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

        const ask = { id: '1', side: OrderSide.Ask, price: 1, volume: 100 } as Order;
        const bid = { id: '2', side: OrderSide.Bid, price: 2, volume: 100 } as Order;

        matchingEngine.submitOrder(ask);
        matchingEngine.submitOrder(bid);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 1);

            const trade = res.first<Trade>();
            assertTrade(trade, bid, ask, 100, 1);

            assertOrderBook(0, 0, matchingEngine);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);

    it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid', done => {
        const matchingEngine = new Matching();

        const ask1 = { id: '1', side: OrderSide.Ask, price: 1, volume: 100 } as Order;
        const ask2 = { id: '2', side: OrderSide.Ask, price: 1, volume: 100 } as Order;
        const bid = { id: '3', side: OrderSide.Bid, price: 1, volume: 200 } as Order;

        matchingEngine.submitOrder(ask1);
        matchingEngine.submitOrder(ask2);
        matchingEngine.submitOrder(bid);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 2);

            const trade1 = res.get<Trade>(0, null);
            assertTrade(trade1, bid, ask1, 100, 1);

            const trade2 = res.get<Trade>(1, null);
            assertTrade(trade2, bid, ask2, 100, 1);

            assertOrderBook(0, 0, matchingEngine);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);

    it('should return 2 trades and fill all orders when having submitted 1 asks and 2 bids', done => {
        const matchingEngine = new Matching();

        const ask = { id: '1', side: OrderSide.Ask, price: 1, volume: 200 } as Order;
        const bid1 = { id: '2', side: OrderSide.Bid, price: 1, volume: 100 } as Order;
        const bid2 = { id: '3', side: OrderSide.Bid, price: 1, volume: 100 } as Order;

        matchingEngine.submitOrder(ask);
        matchingEngine.submitOrder(bid1);
        matchingEngine.submitOrder(bid2);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 2);

            const trade1 = res.get<Trade>(0, null);
            assertTrade(trade1, bid1, ask, 100, 1);

            const trade2 = res.get<Trade>(1, null);
            assertTrade(trade2, bid2, ask, 100, 1);

            assertOrderBook(0, 0, matchingEngine);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);

    it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
        const matchingEngine = new Matching();

        const ask = { id: '1', side: OrderSide.Ask, price: 1, volume: 200 } as Order;
        const bid1 = { id: '2', side: OrderSide.Bid, price: 1, volume: 100 } as Order;
        const bid2 = { id: '3', side: OrderSide.Bid, price: 1, volume: 200 } as Order;

        matchingEngine.submitOrder(ask);
        matchingEngine.submitOrder(bid1);
        matchingEngine.submitOrder(bid2);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 2);

            const trade1 = res.get<Trade>(0, null);
            assertTrade(trade1, bid1, ask, 100, 1);

            const trade2 = res.get<Trade>(1, null);
            assertTrade(trade2, bid2, ask, 100, 1);

            assertOrderBook(0, 1, matchingEngine);

            const partiallyFilledBid = matchingEngine.orderBook().bids.first<Order>();
            assert.equal(partiallyFilledBid.status, OrderStatus.PartiallyFilled);
            assert.equal(partiallyFilledBid.volume, 100);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);

    it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
        const matchingEngine = new Matching();

        const ask1 = { id: '1', side: OrderSide.Ask, price: 1, volume: 200 } as Order;
        const ask2 = { id: '2', side: OrderSide.Ask, price: 2, volume: 200 } as Order;
        const bid1 = { id: '3', side: OrderSide.Bid, price: 1, volume: 100 } as Order;
        const bid2 = { id: '4', side: OrderSide.Bid, price: 2, volume: 200 } as Order;

        matchingEngine.submitOrder(ask1);
        matchingEngine.submitOrder(ask2);
        matchingEngine.submitOrder(bid1);
        matchingEngine.submitOrder(bid2);

        matchingEngine.trades.subscribe(res => {
            assert.equal(res.size, 1);

            const trade1 = res.get<Trade>(0, null);
            assertTrade(trade1, bid2, ask1, 200, 1);

            assertOrderBook(1, 1, matchingEngine);

            done();
        });

        matchingEngine.tick();
    }).timeout(60000);
});
