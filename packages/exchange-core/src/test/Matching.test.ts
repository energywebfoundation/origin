import { IRECDeviceService } from '@energyweb/utils-general';
import { assert } from 'chai';
import { List } from 'immutable';

import { Matching } from '../Matching';
import { Order, OrderSide } from '../Order';
import { Trade } from '../Trade';
import { Product } from '../Product';

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

    const solarTypeLevel1 = deviceService.encode([['Solar']]);
    const solarTypeLevel2 = deviceService.encode([['Solar', 'Photovoltaic']]);
    const solarTypeLevel3 = deviceService.encode([['Solar', 'Photovoltaic', 'Classic silicon']]);
    const solarTypeLevel32 = deviceService.encode([['Solar', 'Photovoltaic', 'Roof mounted']]);

    let initialOrderId = 0;

    const createAsk = (args?: IOrderCreationArgs) => {
        return Order.createAsk(
            (initialOrderId++).toString(),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.product || { assetType: solarTypeLevel3 },
            0
        );
    };

    const createBid = (args?: IOrderCreationArgs) => {
        return Order.createBid(
            (initialOrderId++).toString(),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.product || { assetType: solarTypeLevel3 },
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
        const input = {
            id: order.id,
            price: order.price,
            volume: order.volume,
            product: order.product,
            validFrom: order.validFrom
        };
        const create = (order.side === OrderSide.Bid
            ? Order.createBid
            : Order.createAsk) as Function;

        return (create(...Object.values(input)) as Order).updateVolume(traded);
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

    describe('when asks and bid have to same product', () => {
        it('should trade when price and volume are matching', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid()];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(60000);

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
        }).timeout(1000);

        it('should trade at ask price when bid price is higher than ask', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ price: twoUSD + 1 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(60000);

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid', done => {
            const asksBefore = [createAsk(), createAsk()];
            const bidsBefore = [createBid({ volume: onekWh * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], asksBefore[1].volume, asksBefore[1].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(60000);

        it('should return 2 trades and fill all orders when having submitted 1 asks and 2 bids', done => {
            const asksBefore = [createAsk({ volume: onekWh * 2 })];
            const bidsBefore = [createBid(), createBid()];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[1], asksBefore[0], bidsBefore[1].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(60000);

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            const asksBefore = [createAsk({ volume: onekWh * 2 })];
            const bidsBefore = [createBid({ volume: onekWh }), createBid({ volume: onekWh * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
                new Trade(bidsBefore[1], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            const bidsAfter = [cloneOrder(bidsBefore[1], onekWh)];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades, bidsAfter }, done);
        }).timeout(60000);

        it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', done => {
            /*
            order book before:
            ask1 (2;200) bid2 (4;200)
            ask2 (4;200) bid1 (2;100)
            ---
            trades:
            ask1<->bid2 at (2;200)
            ---
            order book after:
            ask2 (4;200) bid1(2;100)
            */

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

    describe('when ask is solar level 3 specific asset type', () => {
        it('should trade when bid is solar level 1 specific asset type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { assetType: solarTypeLevel1 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(1000);

        it('should trade when bid is solar level 2 specific asset type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { assetType: solarTypeLevel2 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(1000);

        it('should not trade when bid is solar level 2 specific asset type but ask price is higher', done => {
            const asksBefore = [createAsk({ price: twoUSD * 2 })];
            const bidsBefore = [createBid({ product: { assetType: solarTypeLevel2 } })];

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
        }).timeout(1000);

        it('should not trade when bid is different solar level 3 specific asset type', done => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { assetType: solarTypeLevel32 } })];

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
        }).timeout(1000);

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid when bid is level 2 specific asset type', done => {
            const asksBefore = [createAsk(), createAsk()];
            const bidsBefore = [
                createBid({
                    volume: onekWh * 2,
                    product: { assetType: solarTypeLevel2 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[0].price)
            ];

            executeTestCase({ asksBefore, bidsBefore, expectedTrades }, done);
        }).timeout(60000);
    });
});
