import BN from 'bn.js';
import { List } from 'immutable';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Logger } from '@nestjs/common';

import { DirectBuy } from './DirectBuy';
import { IMatchableOrder, OrderSide } from './Order';
import { IPriceStrategy } from './strategy/IPriceStrategy';
import { Trade } from './Trade';
import { TradeExecutedEvent } from './TradeExecutedEvent';

export enum ActionResult {
    Cancelled,
    Error
}

export type ActionResultEvent = { orderId: string; result: ActionResult; error?: string };

export type OrderBook<TProduct, TProductFilter> = {
    asks: List<IMatchableOrder<TProduct, TProductFilter>>;
    bids: List<IMatchableOrder<TProduct, TProductFilter>>;
};

enum ActionKind {
    AddOrder,
    AddDirectBuy,
    CancelOrder
}

type OrderBookAction<TProduct, TProductFilter> = {
    kind: ActionKind;
    value: IMatchableOrder<TProduct, TProductFilter> | DirectBuy | string;
};

const prettyJSON = (input: any) => JSON.stringify(input, null, 2);

export class MatchingEngine<TProduct, TProductFilter> {
    private logger = new Logger(MatchingEngine.name);

    private bids: List<IMatchableOrder<TProduct, TProductFilter>> = List<
        IMatchableOrder<TProduct, TProductFilter>
    >();

    private asks: List<IMatchableOrder<TProduct, TProductFilter>> = List<
        IMatchableOrder<TProduct, TProductFilter>
    >();

    private readonly triggers = new Subject();

    public trades = new Subject<List<TradeExecutedEvent>>();

    public actionResults = new Subject<List<ActionResultEvent>>();

    private pendingActions = List<OrderBookAction<TProduct, TProductFilter>>();

    constructor(private readonly priceStrategy: IPriceStrategy) {
        this.triggers.pipe(concatMap(async () => this.trigger())).subscribe();
    }

    public submitOrder(order: IMatchableOrder<TProduct, TProductFilter>): void {
        this.logger.debug(`Submitting order: ${prettyJSON(order)}`);
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.AddOrder,
            value: order.clone()
        });
    }

    public submitDirectBuy(directBuy: DirectBuy): void {
        this.logger.debug(`Submitting direct buy: ${prettyJSON(directBuy)}`);
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.AddDirectBuy,
            value: directBuy.clone()
        });
    }

    public cancelOrder(orderId: string): void {
        this.logger.debug(`Submitting cancel order: ${orderId}`);
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.CancelOrder,
            value: orderId
        });
    }

    public orderBook(): OrderBook<TProduct, TProductFilter> {
        const now = new Date();
        const validFromFilter = (order: IMatchableOrder<TProduct, TProductFilter>) =>
            order.validFrom <= now;

        return {
            asks: this.asks.filter(validFromFilter),
            bids: this.bids.filter(validFromFilter)
        };
    }

    public orderBookByProduct(productFilter: TProductFilter): OrderBook<TProduct, TProductFilter> {
        const { asks, bids } = this.orderBook();

        const filteredAsks = asks.filter((ask) => ask.filterBy(productFilter));
        const filteredBids = bids.filter((bid) => bid.filterBy(productFilter));

        return { asks: filteredAsks, bids: filteredBids };
    }

    public tick(): void {
        this.triggers.next();
    }

    private insertOrder(order: IMatchableOrder<TProduct, TProductFilter>) {
        if (order.side === OrderSide.Ask) {
            this.asks = this.insert(this.asks, order);
        } else {
            this.bids = this.insert(this.bids, order);
        }
    }

    private trigger() {
        const actions = this.pendingActions;

        let trades = List<Trade>();
        let statusChange = List<ActionResultEvent>();

        actions.forEach((action) => {
            switch (action.kind) {
                case ActionKind.AddOrder: {
                    try {
                        const order = action.value as IMatchableOrder<TProduct, TProductFilter>;

                        this.insertOrder(order);
                        trades = trades.concat(this.match());
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                }
                case ActionKind.CancelOrder: {
                    try {
                        const id = action.value as string;
                        const cancelEvent = this.cancel(id);

                        statusChange = statusChange.concat(cancelEvent);
                    } catch (error) {
                        console.log(error);
                    }

                    break;
                }
                case ActionKind.AddDirectBuy: {
                    const directBuy = action.value as DirectBuy;
                    try {
                        const trade = this.directBuy(directBuy);

                        trades = trades.concat(trade);
                    } catch (error) {
                        const notExecutedEvent: ActionResultEvent = {
                            orderId: directBuy.id,
                            result: ActionResult.Error,
                            error: error.msg
                        };
                        statusChange = statusChange.concat(notExecutedEvent);
                    }
                    break;
                }
                default:
                    throw new Error('Unexpected action');
            }
        });

        this.cleanOrderBook();
        this.pendingActions = this.pendingActions.clear();

        if (!trades.isEmpty()) {
            this.trades.next(trades.map((trade) => new TradeExecutedEvent(trade)));
        }
        if (!statusChange.isEmpty()) {
            this.actionResults.next(statusChange);
        }
        return true;
    }

    private insert(
        orderBook: List<IMatchableOrder<TProduct, TProductFilter>>,
        order: IMatchableOrder<TProduct, TProductFilter>
    ) {
        const unSorted = orderBook.concat(order);
        const direction = order.side === OrderSide.Ask ? 1 : -1;

        return unSorted.sortBy((o) => direction * o.price);
    }

    private directBuy(bid: DirectBuy): Trade {
        const ask = this.asks.find((o) => o.id === bid.askId);

        if (ask.userId === bid.userId) {
            throw new Error(
                `Unable to direct buy your own bid: bid=${JSON.stringify(bid)} ask=${JSON.stringify(
                    ask
                )}`
            );
        }
        if (ask.volume.lt(bid.volume)) {
            throw new Error(
                `Remaining volume is too low: ask.volume=${ask.volume.toString(
                    10
                )} bid.volume=${bid.volume.toString(10)}`
            );
        }
        if (ask.price !== bid.price) {
            throw new Error('Unexpected price change');
        }

        const tradedVolume = bid.volume;
        const updatedAsk = ask.updateWithTradedVolume(tradedVolume);
        const updatedBid = bid.updateWithTradedVolume(tradedVolume);

        this.asks = this.updateOrder(this.asks, updatedAsk);

        return new Trade(updatedBid, updatedAsk, tradedVolume, bid.price);
    }

    private match() {
        this.logger.debug(`Triggering match`);
        const { bids, asks } = this.orderBook();
        this.logger.debug(`Order book view: asks: ${prettyJSON(asks)} bids: ${prettyJSON(bids)}`);
        const executed = this.generateTrades(asks, bids);
        this.logger.debug(
            `Executed trades: ${prettyJSON(
                executed.map((t) => ({
                    ask: t.ask.id,
                    bid: t.bid.id,
                    vol: t.volume.toString(10),
                    price: t.price
                }))
            )} `
        );
        // TODO: check if needed
        // this.updateOrderBook(executed);

        return executed;
    }

    private cancel(orderId: string): ActionResultEvent {
        const asks = this.findAndRemove(this.asks, orderId);
        if (asks.result) {
            this.asks = asks.modified;
        } else {
            const bids = this.findAndRemove(this.bids, orderId);
            if (bids.result) {
                this.bids = bids.modified;
            } else {
                throw new Error('Unexpected orderId');
            }
        }

        return {
            orderId,
            result: ActionResult.Cancelled
        };
    }

    private findAndRemove(
        source: List<IMatchableOrder<TProduct, TProductFilter>>,
        orderId: string
    ): { result: boolean; modified?: List<IMatchableOrder<TProduct, TProductFilter>> } {
        const key = source.findKey((o) => o.id === orderId);

        return key !== undefined
            ? { result: true, modified: source.remove(key) }
            : { result: false };
    }

    private updateOrder(
        source: List<IMatchableOrder<TProduct, TProductFilter>>,
        order: IMatchableOrder<TProduct, TProductFilter>
    ) {
        return source.set(
            source.findIndex((o) => o.id === order.id),
            order
        );
    }

    // private updateOrderBook(matched: List<Trade>) {
    //     matched.forEach((m) => {
    //         this.asks = this.updateOrder(this.asks, m.ask);
    //         this.bids = this.updateOrder(this.bids, m.bid);
    //     });
    // }

    private cleanOrderBook() {
        this.asks = this.asks.filterNot((ask) => ask.isFilled);
        this.bids = this.bids.filterNot((bid) => bid.isFilled);
    }

    private generateTrades(
        asks: List<IMatchableOrder<TProduct, TProductFilter>>,
        bids: List<IMatchableOrder<TProduct, TProductFilter>>
    ) {
        let executed = List<Trade>();

        bids.forEach((bid) => {
            asks.forEach((ask) => {
                const isMatching = this.matches(bid, ask);
                if (!isMatching) {
                    return true;
                }

                const filled = BN.min(ask.volume, bid.volume);
                const price = this.priceStrategy.pickPrice(ask, bid);

                ask.updateWithTradedVolume(filled);
                bid.updateWithTradedVolume(filled);

                executed = executed.concat(new Trade(bid, ask, filled, price));

                return true;
            });
        });

        return executed;
    }

    private matches(
        bid: IMatchableOrder<TProduct, TProductFilter>,
        ask: IMatchableOrder<TProduct, TProductFilter>
    ) {
        const hasProductMatched = bid.matches(ask);
        const hasAskVolume = !ask.volume.isNeg() && !ask.volume.isZero();
        const hasBidVolume = !bid.volume.isNeg() && !bid.volume.isZero();
        const hasPriceMatched = ask.price <= bid.price;
        const sameOwner = bid.userId === ask.userId;

        this.logger.debug(
            `[ask: ${ask.id} <-> bid: ${
                bid.id
            }] hasProductMatched: ${hasProductMatched} hasAskVolume: ${hasAskVolume} hasBidVolume: ${hasBidVolume} hasPriceMatched: ${hasPriceMatched} notSameOwner: ${!sameOwner}`
        );

        return hasPriceMatched && hasAskVolume && hasBidVolume && hasProductMatched && !sameOwner;
    }
}
