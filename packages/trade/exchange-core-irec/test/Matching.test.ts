import {
    ActionResult,
    ActionResultEvent,
    Order,
    OrderSide,
    Testing,
    Trade
} from '@energyweb/exchange-core';
import { DeviceTypeService, LocationService } from '@energyweb/utils-general';
import BN from 'bn.js';
import moment from 'moment';

import {
    AskProduct,
    BidProduct,
    DeviceVintage,
    Filter,
    IRECProduct,
    IRECProductFilter,
    Operator,
    TimeRange
} from '../src';

interface IOrderCreationArgs {
    product?: IRECProduct;
    price?: number;
    volume?: BN;
    userId?: string;
    validFrom?: Date;
    createdAt?: Date;
}

describe('Matching tests', () => {
    const testing = new Testing<IRECProduct, IRECProductFilter>();

    const deviceService = new DeviceTypeService([
        ['Solar'],
        ['Solar', 'Photovoltaic'],
        ['Solar', 'Photovoltaic', 'Roof mounted'],
        ['Solar', 'Photovoltaic', 'Ground mounted'],
        ['Solar', 'Photovoltaic', 'Classic silicon'],
        ['Solar', 'Concentration'],
        ['Wind'],
        ['Wind', 'Onshore'],
        ['Wind', 'Offshore'],
        ['Marine'],
        ['Marine', 'Tidal'],
        ['Marine', 'Tidal', 'Inshore'],
        ['Marine', 'Tidal', 'Offshore']
    ]);
    const locationService = new LocationService();

    const defaultBuyer = '1';
    const defaultSeller = '2';
    const otherSeller = '3';

    const twoUSD = 2;
    const onekWh = new BN(1000);
    const twoKWh = new BN(2000);
    const threeKWh = new BN(3000);
    const fourKWh = new BN(4000);
    const defaultTimeRange: TimeRange = {
        from: moment('2020-01-01').toDate(),
        to: moment('2020-01-31').toDate()
    };

    const deviceVintage = new DeviceVintage(2019);
    const locationCentral = ['Thailand;Central;Nakhon Pathom'];
    const locationEast = ['Thailand;East;Nakhon Pathom'];

    const solarTypeLevel1 = deviceService.encode([['Solar']]);
    const solarTypeLevel2 = deviceService.encode([['Solar', 'Photovoltaic']]);
    const solarTypeLevel3 = deviceService.encode([['Solar', 'Photovoltaic', 'Classic silicon']]);
    const solarTypeLevel32 = deviceService.encode([['Solar', 'Photovoltaic', 'Roof mounted']]);

    const windTypeLevel1 = deviceService.encode([['Wind']]);
    const windTypeLevel2 = deviceService.encode([['Wind', 'Onshore']]);
    const windTypeLevel22 = deviceService.encode([['Wind', 'Offshore']]);

    const marineTypeLevel3 = deviceService.encode([['Marine', 'Tidal', 'Offshore']]);
    const marineTypeLevel1 = deviceService.encode([['Marine']]);

    const defaultGridOperator = 'TH-MEA';

    const defaultProduct: IRECProduct = {
        deviceType: solarTypeLevel3,
        deviceVintage,
        location: locationCentral,
        generationTime: defaultTimeRange,
        gridOperator: [defaultGridOperator]
    };

    const allFilters = new IRECProductFilter();

    let initialOrderId = 0;

    const createAsk = (args?: IOrderCreationArgs) => {
        return new Order<IRECProduct, IRECProductFilter>(
            (initialOrderId++).toString(),
            OrderSide.Ask,
            args?.validFrom || new Date(),
            new AskProduct(
                {
                    ...defaultProduct,
                    ...args?.product
                },
                deviceService,
                locationService
            ),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.userId || defaultSeller,
            args?.createdAt || new Date()
        );
    };

    const createBid = (args?: IOrderCreationArgs) => {
        return new Order<IRECProduct, IRECProductFilter>(
            (initialOrderId++).toString(),
            OrderSide.Bid,
            args?.validFrom || new Date(),
            new BidProduct(
                {
                    ...defaultProduct,
                    ...args?.product
                },
                deviceService,
                locationService
            ),
            args?.price || twoUSD,
            args?.volume || onekWh,
            args?.userId || defaultBuyer,
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

    describe('when ask is solar level 3 specific device type', () => {
        it('should trade when bid is solar level 1 specific device type', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel1 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should trade when bid is solar level 2 specific device type', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel2 } })];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], asksBefore[0].volume, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should not trade when bid is solar level 2 specific device type but ask price is higher', (done) => {
            const asksBefore = [createAsk({ price: twoUSD * 2 })];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel2 } })];

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    expectedTrades,
                    asksAfter: asksBefore,
                    bidsAfter: bidsBefore
                },
                done
            );
        });

        it('should not trade when bid is different solar level 3 specific device type', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [createBid({ product: { deviceType: solarTypeLevel32 } })];

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    expectedTrades,
                    asksAfter: asksBefore,
                    bidsAfter: bidsBefore
                },
                done
            );
        });

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid when bid is level 2 specific device type', (done) => {
            const asksBefore = [createAsk(), createAsk()];
            const bidsBefore = [
                createBid({
                    volume: twoKWh,
                    product: { deviceType: solarTypeLevel2 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should return 2 trades and fill all orders when having submitted 2 asks and 1 bid when bid is level 2 specific device type', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceType: windTypeLevel2 }
                }),
                createAsk({ product: { deviceType: windTypeLevel22 } }),
                createAsk({ product: { deviceType: solarTypeLevel3 } })
            ];
            const bidsBefore = [
                createBid({
                    volume: twoKWh,
                    product: { deviceType: windTypeLevel1 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price)
            ];

            const asksAfter = [asksBefore[2]];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, asksAfter },
                done
            );
        });
    });

    describe('unspecified product matching', () => {
        it('should buy 2 asks', (done) => {
            const asksBefore = [
                createAsk({ product: { deviceType: windTypeLevel2 }, price: 3 }),
                createAsk({ product: { deviceType: windTypeLevel22 }, price: 2 }),
                createAsk({ product: { deviceType: solarTypeLevel3 }, price: 1 })
            ];

            const bidsBefore = [
                createBid({
                    volume: threeKWh,
                    product: { deviceType: [] }
                })
            ];

            const asksAfter = [asksBefore[0]];
            const bidsAfter = [bidsBefore[0].clone().updateWithTradedVolume(twoKWh)];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[2], onekWh, asksBefore[2].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, asksAfter, bidsAfter },
                done
            );
        });
    });

    describe('order book filtering by product', () => {
        it('should return whole order book when no product was set', () => {
            const { asks, bids } = createOrderBookWithSpread([{}, {}, {}], [{}, {}, {}]);

            testing.executeOrderBookQuery(asks, bids, allFilters, asks, bids);
        });

        it('should return order book based on device type where bids are "buy anything" product', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } }
                ],
                [{}, {}, {}]
            );

            const expectedAsks = asks.slice(0, -1);

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    deviceType: solarTypeLevel2,
                    deviceTypeFilter: Filter.Specific
                },
                expectedAsks,
                bids
            );
        });

        it('should return order book based on device type where bids are "buy anything" product and no filter defined', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } }
                ],
                [{ product: {} }, { product: {} }, { product: {} }]
            );

            testing.executeOrderBookQuery(asks, bids, allFilters, asks, bids);
        });

        it('should return order book based on device type where bids are "buy anything"', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } }
                ],
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: [] } },
                    { product: { deviceType: [] } }
                ]
            );

            const bidsAfter = [bids[1], bids[2]];

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    deviceTypeFilter: Filter.Unspecified
                },
                asks,
                bidsAfter
            );
        });

        it('should return order book based on device type where bids are windType on level 1 and level 2', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } }
                ],
                [
                    { product: { deviceType: windTypeLevel1 } },
                    { product: { deviceType: windTypeLevel2 } },
                    { product: { deviceType: windTypeLevel2 } }
                ]
            );

            const expectedAsks = asks.slice(-1);

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    deviceType: windTypeLevel2,
                    deviceTypeFilter: Filter.Specific
                },
                expectedAsks,
                bids
            );
        });

        it('should return order book based on device type where bids are of different types', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } }
                ],
                [
                    { product: { deviceType: windTypeLevel1 } },
                    { product: { deviceType: windTypeLevel2 } },
                    { product: { deviceType: solarTypeLevel1 } },
                    { product: { deviceType: solarTypeLevel2 } }
                ]
            );

            const expectedAsks = [asks[0], asks[1]];
            const expectedBids = [bids[2], bids[3]];

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    deviceType: solarTypeLevel1,
                    deviceTypeFilter: Filter.Specific
                },
                expectedAsks,
                expectedBids
            );
        });

        it('should return order book based on device type where bids are of different types with multiple choices', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    { product: { deviceType: solarTypeLevel3 } },
                    { product: { deviceType: solarTypeLevel32 } },
                    { product: { deviceType: windTypeLevel2 } },
                    { product: { deviceType: marineTypeLevel3 } }
                ],
                [
                    { product: { deviceType: marineTypeLevel1 } },
                    {
                        product: { deviceType: windTypeLevel1.concat(solarTypeLevel1) }
                    },
                    {
                        product: { deviceType: marineTypeLevel1.concat(solarTypeLevel1) }
                    },
                    { product: { deviceType: windTypeLevel2 } },
                    { product: { deviceType: solarTypeLevel1 } },
                    { product: { deviceType: solarTypeLevel2 } }
                ]
            );

            const expectedAsks = asks.slice(0, -1);
            const expectedBids = bids.slice(1);

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    deviceType: solarTypeLevel1.concat(windTypeLevel1),
                    deviceTypeFilter: Filter.Specific
                },
                expectedAsks,
                expectedBids
            );
        });

        it('should return order book based on location', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    {
                        product: { location: locationCentral, deviceType: solarTypeLevel3 }
                    },
                    {
                        product: { location: locationEast, deviceType: solarTypeLevel3 }
                    },
                    {
                        product: { location: locationCentral, deviceType: solarTypeLevel3 }
                    }
                ],
                [
                    { product: { location: ['Thailand'] } },
                    { product: { location: ['Thailand'] } },
                    { product: { location: locationCentral } },
                    { product: { location: locationEast } }
                ]
            );

            const expectedAsks = [asks[1]];
            const expectedBids = [bids[0], bids[1], bids[3]];

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    location: locationEast,
                    locationFilter: Filter.Specific
                },
                expectedAsks,
                expectedBids
            );
        });

        it('should return order book based on multiple locations', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    {
                        product: { location: locationCentral, deviceType: solarTypeLevel3 }
                    },
                    {
                        product: { location: locationEast, deviceType: solarTypeLevel3 }
                    },
                    {
                        product: { location: locationCentral, deviceType: solarTypeLevel3 }
                    }
                ],
                [
                    { product: { location: ['Thailand'] } },
                    { product: { location: ['Thailand;Central'] } },
                    { product: { location: locationCentral } },
                    { product: { location: locationEast } },
                    { product: { location: ['Malaysia'] } }
                ]
            );

            const expectedAsks = asks;
            const expectedBids = bids.slice(0, -1);

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    location: locationEast.concat(locationCentral),
                    locationFilter: Filter.Specific
                },
                expectedAsks,
                expectedBids
            );
        });
    });

    describe('vintage matching', () => {
        it('should not match when ask vintage not equals bid vintage', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceVintage: new DeviceVintage(2010), deviceType: solarTypeLevel3 }
                })
            ];
            const bidsBefore = [
                createBid({
                    product: {
                        deviceVintage: new DeviceVintage(2011),
                        deviceType: solarTypeLevel3
                    }
                })
            ];

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should match when ask vintage is younger than bid', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceVintage: new DeviceVintage(2018), deviceType: solarTypeLevel3 }
                })
            ];
            const bidsBefore = [
                createBid({
                    product: {
                        deviceVintage: new DeviceVintage(2010, Operator.GreaterThanOrEqualsTo),
                        deviceType: solarTypeLevel3
                    }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should match when bid vintage is the same as ask', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceVintage: new DeviceVintage(2018), deviceType: solarTypeLevel3 }
                })
            ];
            const bidsBefore = [
                createBid({
                    product: { deviceVintage: new DeviceVintage(2018), deviceType: solarTypeLevel3 }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });
    });

    describe('location matching', () => {
        it('should not match with different region', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand;East'] }
                })
            ];

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should match with same region', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand;Central'] }
                }),
                createBid({
                    product: { location: ['Thailand;East'] }
                })
            ];

            const bidsAfter = bidsBefore.slice(-1);

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, bidsAfter },
                done
            );
        });

        it('should match with same country', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand'] }
                }),
                createBid({
                    product: { location: ['Malaysia'] }
                })
            ];

            const bidsAfter = bidsBefore.slice(-1);

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, bidsAfter },
                done
            );
        });
    });

    describe('Grid operator', () => {
        it('should match when grid operator is not set', (done) => {
            const asksBefore = [createAsk({ product: { gridOperator: undefined } })];
            const bidsBefore = [
                createBid({
                    product: { gridOperator: undefined }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should not match on different grid operator', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [
                createBid({
                    product: { gridOperator: ['TH-PEA'] }
                })
            ];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    asksAfter: asksBefore,
                    bidsAfter: bidsBefore,
                    expectedTrades: []
                },
                done
            );
        });

        it('should match when bid has multiple grid operator', (done) => {
            const asksBefore = [createAsk()];
            const bidsBefore = [
                createBid({
                    product: { gridOperator: ['TH-PEA', defaultGridOperator] }
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price)
            ];

            testing.executeTestCase(
                {
                    orders: [...asksBefore, ...bidsBefore],
                    expectedTrades
                },
                done
            );
        });

        it('should filter on unspecified grid operator', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [{ product: { gridOperator: ['TH-PEA'] } }, {}],
                [
                    {},
                    {
                        product: { gridOperator: ['TH-PEA'] }
                    }
                ]
            );

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    gridOperatorFilter: Filter.Unspecified
                },
                asks,
                []
            );
        });

        it('should filter on specific', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [{ product: { gridOperator: ['TH-PEA'] } }, {}],
                [
                    {},
                    {
                        product: { gridOperator: ['TH-PEA'] }
                    }
                ]
            );

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    gridOperatorFilter: Filter.Specific,
                    gridOperator: ['TH-PEA', 'TH-ANY']
                },
                [asks[0]],
                [bids[1]]
            );
        });
    });

    describe('Multi device type matching', () => {
        it('should match with solar and wind asks', (done) => {
            const asksBefore = [
                createAsk({ product: { deviceType: solarTypeLevel3 } }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bidsBefore = [
                createBid({
                    product: { deviceType: ['Solar', 'Wind'] },
                    volume: twoKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should match with solar only because if was created earlier', (done) => {
            const asksBefore = [
                createAsk({ product: { deviceType: solarTypeLevel3 }, volume: twoKWh }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bidsBefore = [
                createBid({
                    product: { deviceType: ['Solar', 'Wind'] },
                    volume: twoKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], twoKWh, asksBefore[0].price)
            ];

            const asksAfter = [asksBefore[1]];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, asksAfter },
                done
            );
        });

        it('should match with solar and wind and update the remaining bid', (done) => {
            const asksBefore = [
                createAsk({ product: { deviceType: solarTypeLevel3 }, volume: twoKWh }),
                createAsk({ product: { deviceType: windTypeLevel2 } })
            ];
            const bidsBefore = [
                createBid({
                    product: { deviceType: ['Solar', 'Wind'] },
                    volume: fourKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], twoKWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[0].price)
            ];

            const bidsAfter = [bidsBefore[0].clone().updateWithTradedVolume(threeKWh)];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, bidsAfter },
                done
            );
        });
    });

    describe('Multi location matching', () => {
        it('should match with east and central', (done) => {
            const asksBefore = [
                createAsk({ product: { deviceType: solarTypeLevel3, location: locationCentral } }),
                createAsk({ product: { deviceType: solarTypeLevel3, location: locationEast } })
            ];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand;East', 'Thailand;Central'] },
                    volume: twoKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], onekWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[1].price)
            ];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades },
                done
            );
        });

        it('should match with central only because if was created earlier', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceType: solarTypeLevel3, location: locationCentral },
                    volume: twoKWh
                }),
                createAsk({ product: { deviceType: solarTypeLevel3, location: locationEast } })
            ];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand;East', 'Thailand;Central'] },
                    volume: twoKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], twoKWh, asksBefore[0].price)
            ];

            const asksAfter = [asksBefore[1]];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, asksAfter },
                done
            );
        });

        it('should match with central and east and update the remaining bid', (done) => {
            const asksBefore = [
                createAsk({
                    product: { deviceType: solarTypeLevel3, location: locationCentral },
                    volume: twoKWh
                }),
                createAsk({ product: { deviceType: solarTypeLevel3, location: locationEast } })
            ];
            const bidsBefore = [
                createBid({
                    product: { location: ['Thailand;East', 'Thailand;Central'] },
                    volume: fourKWh
                })
            ];

            const expectedTrades = [
                new Trade(bidsBefore[0], asksBefore[0], twoKWh, asksBefore[0].price),
                new Trade(bidsBefore[0], asksBefore[1], onekWh, asksBefore[0].price)
            ];

            const bidsAfter = [bidsBefore[0].clone().updateWithTradedVolume(threeKWh)];

            testing.executeTestCase(
                { orders: [...asksBefore, ...bidsBefore], expectedTrades, bidsAfter },
                done
            );
        });
    });

    describe('Cancellation tests', () => {
        it('should execute cancel action respecting the order', (done) => {
            const ask1 = createAsk({ volume: twoKWh });
            const bid = createBid();
            const cancelAsk1 = ask1.id;
            const bid2 = createBid();

            const expectedTrades = [new Trade(bid, ask1, onekWh, ask1.price)];

            const bidsAfter = [bid2];
            const expectedStatusChanges: ActionResultEvent[] = [
                {
                    orderId: ask1.id,
                    result: ActionResult.Cancelled
                }
            ];

            testing.executeTestCase(
                {
                    orders: [ask1, bid, cancelAsk1, bid2],
                    expectedTrades,
                    bidsAfter,
                    expectedStatusChanges
                },
                done
            );
        });
    });

    describe('generation time matching and filters', () => {
        it('should not match when bid generation time is out of ask generation time', (done) => {
            const ask1 = createAsk({
                product: {
                    generationTime: {
                        from: moment('2020-01-01').toDate(),
                        to: moment('2020-01-31').toDate()
                    }
                }
            });
            const bid1 = createBid({
                product: {
                    generationTime: {
                        from: moment('2020-02-01').toDate(),
                        to: moment('2020-02-29').toDate()
                    }
                }
            });

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                {
                    orders: [ask1, bid1],
                    expectedTrades,
                    asksAfter: [ask1],
                    bidsAfter: [bid1]
                },
                done
            );
        });

        it('should not match when bid partially contains ask generation time', (done) => {
            const ask1 = createAsk({
                product: {
                    generationTime: {
                        from: moment('2020-01-15').toDate(),
                        to: moment('2020-02-15').toDate()
                    }
                }
            });
            const bid1 = createBid({
                product: {
                    generationTime: {
                        from: moment('2020-02-01').toDate(),
                        to: moment('2020-02-29').toDate()
                    }
                }
            });
            const bid2 = createBid({
                product: {
                    generationTime: {
                        from: moment('2020-01-01').toDate(),
                        to: moment('2020-01-31').toDate()
                    }
                }
            });

            const expectedTrades: Trade[] = [];

            testing.executeTestCase(
                {
                    orders: [ask1, bid1, bid2],
                    expectedTrades,
                    asksAfter: [ask1],
                    bidsAfter: [bid1, bid2]
                },
                done
            );
        });

        it('should match when bid contains ask generation time', (done) => {
            const ask1 = createAsk({
                product: {
                    generationTime: {
                        from: moment('2020-01-15').toDate(),
                        to: moment('2020-02-15').toDate()
                    }
                }
            });
            const bid1 = createBid({
                product: {
                    generationTime: {
                        from: moment('2020-01-01').toDate(),
                        to: moment('2020-02-29').toDate()
                    }
                }
            });
            const bid2 = createBid({
                product: {
                    generationTime: {
                        from: moment('2020-01-01').toDate(),
                        to: moment('2020-01-31').toDate()
                    }
                }
            });

            const expectedTrades: Trade[] = [new Trade(bid1, ask1, bid1.volume, ask1.price)];

            testing.executeTestCase(
                {
                    orders: [ask1, bid1, bid2],
                    expectedTrades,
                    bidsAfter: [bid2]
                },
                done
            );
        });

        it('should return bids and asks that matches filter generation time', () => {
            const { asks, bids } = createOrderBookWithSpread(
                [
                    {
                        product: {
                            generationTime: {
                                from: moment('2020-01-15').toDate(),
                                to: moment('2020-02-15').toDate()
                            }
                        }
                    }
                ],
                [
                    {
                        product: {
                            generationTime: {
                                from: moment('2020-01-01').toDate(),
                                to: moment('2020-02-29').toDate()
                            }
                        }
                    },
                    {
                        product: {
                            generationTime: {
                                from: moment('2020-01-01').toDate(),
                                to: moment('2020-01-31').toDate()
                            }
                        }
                    }
                ]
            );

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters,
                    generationTime: {
                        from: moment('2020-01-01').toDate(),
                        to: moment('2020-01-31').toDate()
                    },
                    generationTimeFilter: Filter.Specific
                },
                [],
                bids
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

            testing.executeOrderBookQuery(
                asks,
                bids,
                {
                    ...allFilters
                },
                [asks[1]],
                [bids[0]]
            );
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
});
