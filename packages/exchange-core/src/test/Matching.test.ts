import { IRECDeviceService } from '@energyweb/utils-general';
import { assert } from 'chai';
import { List } from 'immutable';

import { Matching } from '../Matching';
import { Order, OrderSide } from '../Order';
import { Trade } from '../Trade';
import { Product } from '../Product';
import { Ask } from '../Ask';
import { Bid } from '../Bid';

interface IOrderCreationArgs {
    product?: Product;
    price?: number;
    volume?: number;
}

interface ITestCase {
    bidsBefore: Order[];
    asksBefore: Order[];

    expectedTrades: Trade[];

    asksAfter?: Order[];
    bidsAfter?: Order[];
}

describe('Matching tests', () => {
    const deviceService = new IRECDeviceService();

    const twoUSD = 2;
    const onekWh = 1000;
    const vintage = 2019;

    const solarTypeLevel1 = deviceService.encode([['Solar']]);
    const solarTypeLevel2 = deviceService.encode([['Solar', 'Photovoltaic']]);
    const solarTypeLevel3 = deviceService.encode([['Solar', 'Photovoltaic', 'Classic silicon']]);
    const solarTypeLevel32 = deviceService.encode([['Solar', 'Photovoltaic', 'Roof mounted']]);

    const windTypeLevel1 = deviceService.encode([['Wind']]);
    const windTypeLevel2 = deviceService.encode([['Wind', 'Onshore']]);
    const windTypeLevel22 = deviceService.encode([['Wind', 'Offshore']]);

    let initialOrderId = 0;

    const createAsk = (args?: IOrderCreationArgs) => {
        return new Ask(
            (initialOrderId++).toString(),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.product || { deviceType: solarTypeLevel3, deviceVintage: vintage },
            0
        );
    };

    const createBid = (args?: IOrderCreationArgs) => {
        return new Bid(
            (initialOrderId++).toString(),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.product || { deviceType: solarTypeLevel3, deviceVintage: vintage },
            0
        );
    };

    const assertOrders = (expected: List<Order>, current: List<Order>) => {
        assert.equal(expected.size, current.size);

        const zipped = expected.zip(current);

        zipped.forEach(([a1, a2]) => {
            assert.equal(a1.id, a2.id);
            assert.equal(a1.volume, a2.volume);
            assert.equal(a1.status, a2.status);
            assert.equal(a1.price, a2.price);
        });
    };

    const assertTrades = (expected: List<Trade>, current: List<Trade>) => {
        assert.equal(expected.size, current.size);

        const zipped = expected.zip(current);

        zipped.forEach(([t1, t2]) => {
            assert.equal(t1.askId, t2.askId);
            assert.equal(t1.bidId, t2.bidId);
            assert.equal(t1.volume, t2.volume);
            assert.equal(t1.price, t2.price);
        });
    };

    const cloneOrder = (order: Order, traded: number) => {
        const cloned =
            order.side === OrderSide.Bid
                ? new Bid(order.id, order.price, order.volume, order.product, order.validFrom)
                : new Ask(order.id, order.price, order.volume, order.product, order.validFrom);

        return cloned.updateVolume(traded);
    };

    const executeTestCase = (testCase: ITestCase, done: any) => {
        const matchingEngine = new Matching();

        testCase.bidsBefore.forEach(b => matchingEngine.submitOrder(b));
        testCase.asksBefore.forEach(a => matchingEngine.submitOrder(a));

        matchingEngine.trades.subscribe(res => {
            const expectedTrades = List(testCase.expectedTrades);
            assertTrades(expectedTrades, res);

            const expectedBidsAfter = List(testCase.bidsAfter);
            const expectedAsksAfter = List(testCase.asksAfter);

            const { asks, bids } = matchingEngine.orderBook();
            assertOrders(expectedBidsAfter, bids);
            assertOrders(expectedAsksAfter, asks);

            done();
        });

        matchingEngine.tick();

        if (testCase.expectedTrades.length === 0) {
            done();
        }
    };

    const executeOrderBookQuery = (
        asks: Order[],
        bids: Order[],
        product: Product,
        expectedAsks: Order[],
        expectedBids: Order[]
    ) => {
        const matchingEngine = new Matching();

        asks.forEach(b => matchingEngine.submitOrder(b));
        bids.forEach(a => matchingEngine.submitOrder(a));

        const orderBook = matchingEngine.orderBookByProduct(product);

        assertOrders(List<Order>(expectedAsks), orderBook.asks);
        assertOrders(List<Order>(expectedBids), orderBook.bids);
    };

    describe('when asks and bid have to same product', () => {
        it('should trade when price and volume are matching', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid()];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should not trade bid price is too low', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ price: twoUSD - 1 })];

            const expectedTrades: Trade[] = [];

            executeTestCase(
                {
                    asksBefore,
                    bidsBefore,
                    expectedTrades,
                    bidsAfter: bidsBefore,
                    asksAfter: asksBefore
                },
                done
            );
        });

        it('should trade at ask price when bid price is higher than ask', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ price: twoUSD + 1 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid', done => {
            const asksBefore = [createAsk(), createAsk()];
            const bidsBefore = [createBid({ volume: onekWh * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], asksBefore[1].volume, asksBefore[1].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should return 2 trades and fill all orders when having submitted 1 asks and 2 bids', done => {
            const asksBefore = [createAsk({ volume: onekWh * 2 })];
            const bidsBefore = [createBid(), createBid()];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[1], asksBefore[0], bidsBefore[1].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            const asksBefore = [createAsk({ volume: onekWh * 2 })];
            const bidsBefore = [createBid({ volume: onekWh }), createBid({ volume: onekWh * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[1], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            const bidsAfter = [cloneOrder(bidsBefore[1], onekWh)];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades, bidsAfter }, done);
        });

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            const asksBefore = [
                createAsk({ volume: onekWh * 2 }),
                createAsk({ volume: onekWh * 2, price: twoUSD * 2 })
            ];
            const bidsBefore = [createBid(), createBid({ volume: onekWh * 2, price: twoUSD * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[1], asksBefore[0], onekWh * 2, asksBefore[0].price)
            ];

            const asksAfter = [asksBefore[1]];
            const bidsAfter = [bidsBefore[0]];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades, asksAfter, bidsAfter }, done);
        });
    });

    describe('when ask is solar level 3 specific device type', () => {
        it('should trade when bid is solar level 1 specific device type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel1 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should trade when bid is solar level 2 specific device type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel2 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should not trade when bid is solar level 2 specific device type but ask price is higher', done => {
            const asksBefore = [createAsk({ price: twoUSD * 2 })];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel2 } })];

            const expectedTrades: Trade[] = [];

            executeTestCase(
                {
                    asksBefore,
                    bidsBefore,
                    expectedTrades,
                    asksAfter: asksBefore,
                    bidsAfter: bidsBefore
                },
                done
            );
        });

        it('should not trade when bid is different solar level 3 specific device type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel32 } })];

            const expectedTrades: Trade[] = [];

            executeTestCase(
                {
                    asksBefore,
                    bidsBefore,
                    expectedTrades,
                    asksAfter: asksBefore,
                    bidsAfter: bidsBefore
                },
                done
            );
        });

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid when bid is level 2 specific device type', done => {
            const asksBefore = [createAsk(), createAsk()];
            const bidsBefore = [
                createBid({
                    volume: onekWh * 2,
                    product: { deviceType: solarTypeLevel2 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        });

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid when bid is level 2 specific device type', done => {
            const asksBefore = [
                createAsk({ product: { deviceType: windTypeLevel2 } }),
                createAsk({ product: { deviceType: windTypeLevel22 } }),
                createAsk({ product: { deviceType: solarTypeLevel3 } })
            ];
            const bidsBefore = [
                createBid({
                    volume: onekWh * 2,
                    product: { deviceType: windTypeLevel1 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price)
            ];

            const asksAfter = [asksBefore[2]];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades, asksAfter }, done);
        });
    });

    describe('order book filtering by product', () => {
        it('should return whole order book when no product was set', () => {
            const asks = [createAsk(), createAsk(), createAsk()];
            const bids = [createBid(), createBid(), createBid()];

            executeOrderBookQuery(asks, bids, {}, asks, bids);
        });

        it('should return order book based on device type where bids are "buy anything" product', () => {
            const asks = [
                createAsk({ product: { deviceType: solarTypeLevel3 } }),
                createAsk({ product: { deviceType: solarTypeLevel32 } }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bids = [
                createBid({ product: {} }),
                createBid({ product: {} }),
                createBid({ product: {} })
            ];

            const expectedAsks = asks.slice(0, -1);

            executeOrderBookQuery(asks, bids, { deviceType: solarTypeLevel2 }, expectedAsks, bids);
        });

        it('should return order book based on device type where bids are windType on level 1 and level 2', () => {
            const asks = [
                createAsk({ product: { deviceType: solarTypeLevel3 } }),
                createAsk({ product: { deviceType: solarTypeLevel32 } }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bids = [
                createBid({ product: { deviceType: windTypeLevel1 } }),
                createBid({ product: { deviceType: windTypeLevel2 } }),
                createBid({ product: { deviceType: windTypeLevel2 } })
            ];

            const expectedAsks = asks.slice(-1);

            executeOrderBookQuery(asks, bids, { deviceType: windTypeLevel2 }, expectedAsks, bids);
        });

        it('should return order book based on device type where bids are of different types', () => {
            const asks = [
                createAsk({ product: { deviceType: solarTypeLevel3 } }),
                createAsk({ product: { deviceType: solarTypeLevel32 } }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bids = [
                createBid({ product: { deviceType: windTypeLevel1 } }),
                createBid({ product: { deviceType: windTypeLevel2 } }),
                createBid({ product: { deviceType: solarTypeLevel1 } }),
                createBid({ product: { deviceType: solarTypeLevel2 } })
            ];

            const expectedAsks = [asks[0], asks[1]];
            const expectedBids = [bids[2], bids[3]];

            executeOrderBookQuery(
                asks,
                bids,
                { deviceType: solarTypeLevel1 },
                expectedAsks,
                expectedBids
            );
        });
    });
});
