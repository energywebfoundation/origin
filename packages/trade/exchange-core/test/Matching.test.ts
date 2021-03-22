import BN from 'bn.js';
import moment from 'moment';
import { assert } from 'chai';
import {
    AskPriceStrategy,
    DirectBuy,
    IMatchableOrder,
    MatchingEngine,
    Order,
    OrderSide,
    Trade
} from '../src';
import { TestProduct } from './Product';
import { Testing } from '../src/Testing';
import { OneTimeMatchOrder } from '../src/OneTimeMatchOrder';

type Bid = IMatchableOrder<string, string>;
type Ask = Bid;

export interface IOrderCreationArgs {
    price?: number;
    volume?: BN;
    userId?: string;
    validFrom?: Date;
    createdAt?: Date;
}

describe('Matching tests', () => {
    const testing = new Testing<string, string>();

    let initialOrderId = 0;

    const matchableProduct = new TestProduct();

    const defaultBuyer = '1';

    const defaultSeller = '2';

    const otherSeller = '3';

    const twoUSD = 2;

    const onekWh = new BN(1000);

    const twoKWh = new BN(2000);

    const threeKWh = new BN(3000);

    const createAsk = (args?: IOrderCreationArgs) => {
        return new Order<string, string>(
            (initialOrderId++).toString(),
            OrderSide.Ask,
            args?.validFrom || new Date(),
            matchableProduct,
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.userId || defaultSeller,
            args?.createdAt || new Date()
        );
    };

    const createOneTimeMatchAsk = (args?: IOrderCreationArgs) => {
        return new OneTimeMatchOrder<string, string>(
            (initialOrderId++).toString(),
            OrderSide.Ask,
            args?.validFrom || new Date(),
            matchableProduct,
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.userId || defaultSeller,
            args?.createdAt || new Date()
        );
    };

    const createBid = (args?: IOrderCreationArgs) => {
        return new Order<string, string>(
            (initialOrderId++).toString(),
            OrderSide.Bid,
            args?.validFrom || new Date(),
            matchableProduct,
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.userId || defaultBuyer,
            args?.createdAt || new Date()
        );
    };

    const createDirectBuy = (askId: string, args?: IOrderCreationArgs) => {
        return new DirectBuy(
            (initialOrderId++).toString(),
            args?.userId || defaultBuyer,
            args?.price || twoUSD,
            args?.volume || onekWh,
            askId,
            args?.createdAt || new Date()
        );
    };

    const createOrderBookWithSpread = (asks: IOrderCreationArgs[], bids: IOrderCreationArgs[]) => {
        let startAskPrice = asks.length + bids.length + 2;
        let startBidPrice = startAskPrice - 1;

        return {
            asks: asks.map((a) => createAsk({ ...a, price: startAskPrice++ })),
            bids: bids.map((b) => createBid({ ...b, price: startBidPrice-- }))
        };
    };

    it('should trade when price and volume are matching', (done) => {
        const asksBefore = [createAsk()];
        const bidsBefore = [createBid()];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
        ];

        testing.executeTestCase({ orders: [...asksBefore, ...bidsBefore], expectedTrades }, done);
    });

    it('should not trade when owning both bid and ask', (done) => {
        const asksBefore = [createAsk({ userId: defaultBuyer })];
        const bidsBefore = [createBid({ userId: defaultBuyer })];

        const expectedTrades: Trade[] = [];

        testing.executeTestCase({ orders: [...asksBefore, ...bidsBefore], expectedTrades }, done);
    });

    it('should not trade bid price is too low', (done) => {
        const asksBefore = [createAsk()];
        const bidsBefore = [createBid({ price: twoUSD - 1 })];

        const expectedTrades: Trade[] = [];

        testing.executeTestCase(
            {
                orders: [...asksBefore, ...bidsBefore],
                expectedTrades,
                bidsAfter: bidsBefore,
                asksAfter: asksBefore
            },
            done
        );
    });

    it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid', (done) => {
        const asksBefore = [createAsk(), createAsk()];
        const bidsBefore = [createBid({ volume: onekWh.muln(2) })];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price),
            new Trade(bidsBefore[0], asksBefore[1], asksBefore[1].volume, asksBefore[1].price)
        ];

        testing.executeTestCase({ orders: [...asksBefore, ...bidsBefore], expectedTrades }, done);
    });

    it('should return 2 trades and fill all orders when having submitted 1 asks and 2 bids', (done) => {
        const asksBefore = [createAsk({ volume: twoKWh })];
        const bidsBefore = [createBid(), createBid()];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
            new Trade(bidsBefore[1], asksBefore[0], bidsBefore[1].volume, asksBefore[0].price)
        ];

        testing.executeTestCase({ orders: [...asksBefore, ...bidsBefore], expectedTrades }, done);
    });

    it('should return 2 trades, fill 1st bid and partially fill 2nd bid when having submitted 1 asks and 2 bids', (done) => {
        const asksBefore = [createAsk({ volume: twoKWh })];
        const bidsBefore = [createBid({ volume: onekWh }), createBid({ volume: twoKWh })];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], bidsBefore[0].volume, asksBefore[0].price),
            new Trade(bidsBefore[1], asksBefore[0], onekWh, asksBefore[0].price)
        ];

        const bidsAfter = [bidsBefore[1].clone().updateWithTradedVolume(onekWh)];

        testing.executeTestCase(
            { orders: [...asksBefore, ...bidsBefore], expectedTrades, bidsAfter },
            done
        );
    });

    it('should return 3 trades', (done) => {
        const asksBefore = [
            createAsk({ volume: twoKWh }),
            createAsk({ volume: twoKWh, price: twoUSD * 2 })
        ];
        const bidsBefore = [createBid(), createBid({ volume: twoKWh, price: twoUSD * 2 })];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
            new Trade(bidsBefore[1], asksBefore[0], onekWh, asksBefore[0].price),
            new Trade(bidsBefore[1], asksBefore[1], onekWh, asksBefore[1].price)
        ];

        const asksAfter = [asksBefore[1].clone().updateWithTradedVolume(onekWh)];

        testing.executeTestCase(
            { orders: [...asksBefore, ...bidsBefore], asksAfter, expectedTrades },
            done
        );
    });

    it('should not overmatch bids', (done) => {
        const asksBefore = [
            createAsk({ volume: onekWh.muln(10) }),
            createAsk({ volume: onekWh.muln(10) })
        ];
        const bidsBefore = [createBid(), createBid({ volume: twoKWh })];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
            new Trade(bidsBefore[1], asksBefore[0], twoKWh, asksBefore[0].price)
        ];

        const asksAfter = [asksBefore[0].clone().updateWithTradedVolume(threeKWh), asksBefore[1]];
        const bidsAfter: Bid[] = [];

        testing.executeTestCase(
            {
                orders: [...asksBefore, ...bidsBefore],
                expectedTrades,
                asksAfter,
                bidsAfter
            },
            done
        );
    });

    it('should not overmatch asks', (done) => {
        const asksBefore = [createAsk(), createAsk(), createAsk()];
        const bidsBefore = [createBid({ volume: onekWh.muln(10) })];

        const expectedTrades = [
            new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
            new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price),
            new Trade(bidsBefore[0], asksBefore[2], onekWh, asksBefore[2].price)
        ];

        const asksAfter: Ask[] = [];
        const bidsAfter: Bid[] = [bidsBefore[0].clone().updateWithTradedVolume(threeKWh)];

        testing.executeTestCase(
            {
                orders: [...asksBefore, ...bidsBefore],
                expectedTrades,
                asksAfter,
                bidsAfter
            },
            done
        );
    });

    it('should direct buy send ask', (done) => {
        const ask1 = createAsk();
        const ask2 = createAsk({ price: 2 * ask1.price });

        const directBuy = createDirectBuy(ask2.id, { price: ask2.price });

        const expectedTrades = [new Trade(directBuy, ask2, onekWh, ask2.price)];

        const asksAfter = [ask1];

        testing.executeTestCase(
            {
                orders: [ask1, ask2, directBuy],
                expectedTrades,
                asksAfter
            },
            done
        );
    });

    it('should direct buy partial ask volume', (done) => {
        const ask1 = createAsk();
        const ask2 = createAsk({ price: 2 * ask1.price, volume: twoKWh });

        const directBuy = createDirectBuy(ask2.id, { price: ask2.price });

        const expectedTrades = [new Trade(directBuy, ask2, onekWh, ask2.price)];

        const asksAfter = [ask1, ask2.clone().updateWithTradedVolume(onekWh)];

        testing.executeTestCase(
            {
                orders: [ask1, ask2, directBuy],
                expectedTrades,
                asksAfter
            },
            done
        );
    });

    it('should direct buy partial ask volume and match remaining', (done) => {
        const ask1 = createAsk();
        const ask2 = createAsk({ price: 2 * ask1.price, volume: twoKWh });

        const directBuy = createDirectBuy(ask2.id, { price: ask2.price });
        const bid = createBid({ price: ask2.price, volume: twoKWh });

        const expectedTrades = [
            new Trade(directBuy, ask2, onekWh, ask2.price),
            new Trade(bid, ask1, onekWh, ask1.price),
            new Trade(bid, ask2, onekWh, ask2.price)
        ];

        testing.executeTestCase(
            {
                orders: [ask1, ask2, directBuy, bid],
                expectedTrades
            },
            done
        );
    });

    describe('when matching with one time match asks', () => {
        it('should return 1 trade when having 1 ask and 2 bids', (done) => {
            const asksBefore = [createOneTimeMatchAsk({ volume: twoKWh })];
            const bidsBefore = [createBid(), createBid({ volume: twoKWh, price: twoUSD * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            const bidsAfter = [bidsBefore[1]];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], bidsAfter, expectedTrades },
                done
            );
        });

        it('should return 2 trade when having 2 ask and 2 bids', (done) => {
            const asksBefore = [
                createOneTimeMatchAsk({ volume: twoKWh }),
                createOneTimeMatchAsk({ volume: twoKWh })
            ];
            const bidsBefore = [createBid(), createBid({ volume: twoKWh, price: twoUSD * 2 })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[1], asksBefore[1], twoKWh, asksBefore[1].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });
    });

    describe('when price strategy is AskPriceStrategy', () => {
        it('should trade at ask price when bid has higher price add was added after ask', (done) => {
            const askCreatedAt = new Date();
            const bidCreatedAt = moment().add(1, 'minute').toDate();

            const asksBefore = [createAsk({ createdAt: askCreatedAt })];
            const bidsBefore = [createBid({ price: twoUSD + 1, createdAt: bidCreatedAt })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    expectedTrades,
                    priceStrategies: [new AskPriceStrategy()]
                },
                done
            );
        });

        it('should trade at ask price when bid has higher price add was added before ask', (done) => {
            const bidCreatedAt = new Date();
            const askCreatedAt = moment().add(1, 'minute').toDate();

            const asksBefore = [createAsk({ createdAt: askCreatedAt })];
            const bidsBefore = [createBid({ price: twoUSD + 1, createdAt: bidCreatedAt })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    expectedTrades,
                    priceStrategies: [new AskPriceStrategy()]
                },
                done
            );
        });
    });

    describe('validFrom tests', () => {
        it('should not disclose the future bids and asks', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    {
                        validFrom: moment().add(1, 'day').toDate()
                    },
                    {}
                ],
                [
                    {},
                    {
                        validFrom: moment().add(1, 'day').toDate()
                    }
                ]
            );

            testing.executeOrderBookQuery(asks, bids, 'filter', [asks[1]], [bids[0]]);
        });

        it('should not match orders with validFrom in the future', (done) => {
            const ask1 = createAsk();
            const bid1 = createBid({
                validFrom: moment().add(1, 'day').toDate()
            });
            const bid2 = createBid();

            const expectedTrades: Trade[] = [new Trade(bid2, ask1, bid2.volume, ask1.price)];

            testing.executeTestCase(
                {
                    orders: [ask1, bid1, bid2],
                    expectedTrades
                },
                done
            );
        });
    });

    describe('should skip owned ask and continue matching', () => {
        it('should skip 1 ask and matching with 2', (done) => {
            const ask1 = createAsk({ userId: defaultSeller, price: 100 });
            const ask2 = createAsk({ userId: otherSeller, price: 200, volume: twoKWh });
            const bid1 = createBid({ userId: defaultSeller, price: 200 });
            const bid2 = createBid({ userId: defaultSeller, price: 200 });

            const expectedTrades: Trade[] = [
                new Trade(bid1, ask2, bid1.volume, ask2.price),
                new Trade(bid2, ask2, bid2.volume, ask2.price)
            ];

            testing.executeTestCase(
                {
                    orders: [ask1, ask2, bid1, bid2],
                    expectedTrades,
                    asksAfter: [ask1]
                },
                done
            );
        });
    });

    describe('should test clearing matching engine cache', () => {
        it('should clear cache', () => {
            const matchingEngine = new MatchingEngine<string, string>(new AskPriceStrategy());

            matchingEngine.submitOrder(createAsk({ userId: defaultSeller, price: 100 }));

            matchingEngine.tick();
            assert.equal(matchingEngine.orderBook().asks.count(), 1);

            matchingEngine.clear();
            assert.equal(matchingEngine.orderBook().asks.count(), 0);
        });
    });
});
