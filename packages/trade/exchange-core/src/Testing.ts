/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { assert } from 'chai';
import { List } from 'immutable';

import {
    ActionResultEvent,
    AskPriceStrategy,
    DirectBuy,
    IMatchableOrder,
    IPriceStrategy,
    MatchingEngine,
    OrderCreationTimePickStrategy,
    Trade
} from '.';
import { TestLogger } from './TestLogger';

interface ITestCase<TProduct, TProductFilter> {
    orders: (IMatchableOrder<TProduct, TProductFilter> | DirectBuy | string)[];

    expectedTrades: Trade[];

    asksAfter?: IMatchableOrder<TProduct, TProductFilter>[];
    bidsAfter?: IMatchableOrder<TProduct, TProductFilter>[];

    expectedStatusChanges?: ActionResultEvent[];

    priceStrategies?: IPriceStrategy[];
}

export class Testing<TProduct, TProductFilter> {
    assertOrders(
        expected: List<IMatchableOrder<TProduct, TProductFilter>>,
        current: List<IMatchableOrder<TProduct, TProductFilter>>,
        type: string
    ) {
        assert.equal(current.size, expected.size, `Expected amount of ${type} orders`);

        const zipped = expected.zip(current);

        zipped.forEach(([a1, a2]) => {
            assert.equal(a1.id, a2.id, 'Wrong order id');
            assert.equal(a1.volume.toString(10), a2.volume.toString(10), 'Wrong volume');
            assert.equal(a1.price, a2.price, 'Wrong price');
        });
    }

    assertTrades(expected: List<Trade>, current: List<Trade>) {
        assert.equal(
            current.size,
            expected.size,
            `Expected amount of trades: current=${JSON.stringify(
                current
            )} expected=${JSON.stringify(expected)}`
        );

        const zipped = expected.zip(current);

        zipped.forEach(([t1, t2]) => {
            assert.equal(t1.ask.id, t2.ask.id, 'Wrong askId');
            assert.equal(t1.bid.id, t2.bid.id, 'Wrong bidId');
            assert.equal(t1.volume.toString(10), t2.volume.toString(10), 'Wrong volume');
            assert.equal(t1.price, t2.price, 'Wrong price');
        });
    }

    assertStatusChanges(expected: List<ActionResultEvent>, current: List<ActionResultEvent>) {
        assert.equal(current.size, expected.size, 'Expected amount of status changes');

        const zipped = expected.zip(current);

        zipped.forEach(([t1, t2]) => {
            assert.deepEqual(t1, t2);
        });
    }

    executeTestCase(testCase: ITestCase<TProduct, TProductFilter>, done: any) {
        const strategies = testCase?.priceStrategies ?? [
            new AskPriceStrategy(),
            new OrderCreationTimePickStrategy()
        ];
        let doneTimer: NodeJS.Timeout;
        const signalReady = () => {
            clearInterval(doneTimer);
            doneTimer = global.setTimeout(() => done(), 50);
        };
        const expectedTrades = List(testCase.expectedTrades);

        strategies.forEach((priceStrategy: IPriceStrategy) => {
            const matchingEngine = new MatchingEngine<TProduct, TProductFilter>(
                priceStrategy,
                new TestLogger()
            );

            testCase.orders.forEach((a) => {
                if (typeof a === 'string') {
                    matchingEngine.cancelOrder(a);
                } else if (a instanceof DirectBuy) {
                    matchingEngine.submitDirectBuy(a);
                } else {
                    matchingEngine.submitOrder(a);
                }
            });

            matchingEngine.trades.subscribe((res) => {
                this.assertTrades(
                    expectedTrades,
                    res.map((r) => r.trade)
                );

                const expectedBidsAfter = List(testCase.bidsAfter);
                const expectedAsksAfter = List(testCase.asksAfter);

                const { asks, bids } = matchingEngine.orderBook();
                this.assertOrders(expectedBidsAfter, bids, 'bids');
                this.assertOrders(expectedAsksAfter, asks, 'asks');

                signalReady();
            });

            matchingEngine.actionResults.subscribe((res) => {
                const expectedStatusChanges = List(testCase.expectedStatusChanges);

                this.assertStatusChanges(expectedStatusChanges, res);

                signalReady();
            });

            matchingEngine.tick();
        });
        if (testCase.expectedTrades.length === 0 && !testCase.expectedStatusChanges) {
            setTimeout(() => done(), 50);
        }
    }

    executeOrderBookQuery(
        asks: IMatchableOrder<TProduct, TProductFilter>[],
        bids: IMatchableOrder<TProduct, TProductFilter>[],
        productFilter: TProductFilter,
        expectedAsks: IMatchableOrder<TProduct, TProductFilter>[],
        expectedBids: IMatchableOrder<TProduct, TProductFilter>[],
        priceStrategies?: IPriceStrategy[]
    ) {
        const strategies = priceStrategies ?? [
            new AskPriceStrategy(),
            new OrderCreationTimePickStrategy()
        ];
        strategies.forEach((priceStrategy) => {
            const matchingEngine = new MatchingEngine<TProduct, TProductFilter>(
                priceStrategy,
                new TestLogger()
            );

            asks.forEach((b) => matchingEngine.submitOrder(b));
            bids.forEach((a) => matchingEngine.submitOrder(a));

            matchingEngine.tick();

            const orderBook = matchingEngine.orderBookByProduct(productFilter);

            this.assertOrders(
                List<IMatchableOrder<TProduct, TProductFilter>>(expectedAsks),
                orderBook.asks,
                'asks'
            );
            this.assertOrders(
                List<IMatchableOrder<TProduct, TProductFilter>>(expectedBids),
                orderBook.bids,
                'bids'
            );
        });
    }
}
