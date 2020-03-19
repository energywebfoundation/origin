import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import BN from 'bn.js';
import { List } from 'immutable';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Ask } from './Ask';
import { Bid } from './Bid';
import { Order, OrderSide, OrderStatus } from './Order';
import { Product } from './Product';
import { Trade } from './Trade';
import { DirectBuy } from './DirectBuy';

export type TradeExecutedEvent = { trade: Trade; ask: Ask; bid: Bid | DirectBuy };

export type StatusChangedEvent = { orderId: string; status: OrderStatus; prevStatus: OrderStatus };

enum ActionKind {
    AddOrder,
    AddDirectBuy,
    CancelOrder
}

type OrderBookAction = { kind: ActionKind; value: Order | DirectBuy | string };

export class MatchingEngine {
    private bids: List<Bid> = List<Bid>();

    private asks: List<Ask> = List<Ask>();

    private readonly triggers = new Subject();

    public trades = new Subject<List<TradeExecutedEvent>>();

    public orderStatusChange = new Subject<List<StatusChangedEvent>>();

    private pendingActions = List<OrderBookAction>();

    constructor(
        private readonly deviceService: IDeviceTypeService,
        private readonly locationService: ILocationService
    ) {
        this.triggers.pipe(concatMap(async () => this.trigger())).subscribe();
    }

    public submitOrder(order: Ask | Bid) {
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.AddOrder,
            value: order
        });
    }

    public submitDirectBuy(directBuy: DirectBuy) {
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.AddDirectBuy,
            value: directBuy
        });
    }

    public cancelOrder(orderId: string) {
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.CancelOrder,
            value: orderId
        });
    }

    public orderBook() {
        return { asks: this.asks, bids: this.bids };
    }

    public orderBookByProduct(product: Product) {
        const asks = this.asks.filter(ask =>
            ask.filterBy(product, this.deviceService, this.locationService)
        );
        const bids = this.bids.filter(bid =>
            bid.filterBy(product, this.deviceService, this.locationService)
        );

        return { asks, bids };
    }

    public tick() {
        this.triggers.next();
    }

    private insertOrder(order: Order) {
        if (order.side === OrderSide.Ask) {
            this.asks = this.insert(this.asks, order as Ask);
        } else {
            this.bids = this.insert(this.bids, order as Bid);
        }
    }

    private trigger() {
        const actions = this.pendingActions;

        let trades = List<TradeExecutedEvent>();
        let cancelled = List<StatusChangedEvent>();

        actions.forEach(action => {
            switch (action.kind) {
                case ActionKind.AddOrder: {
                    const order = action.value as Order;

                    this.insertOrder(order);
                    trades = trades.concat(this.match());
                    break;
                }
                case ActionKind.CancelOrder: {
                    try {
                        const id = action.value as string;
                        const cancelEvent = this.cancel(id);
                        cancelled = cancelled.concat(cancelEvent);
                    } catch (error) {
                        console.log(error);
                    }

                    break;
                }
                case ActionKind.AddDirectBuy: {
                    const directBuy = action.value as DirectBuy;
                    const trade = this.directBuy(directBuy);

                    trades = trades.concat(trade);
                    break;
                }
                default:
                    throw new Error('Unexpected action');
            }
        });

        this.cleanOrderBook();

        if (!trades.isEmpty()) {
            this.trades.next(trades);
        }
        if (!cancelled.isEmpty()) {
            this.orderStatusChange.next(cancelled);
        }
        return true;
    }

    private insert<T extends Order>(orderBook: List<T>, order: T) {
        const unSorted = orderBook.concat(order);
        const direction = order.side === OrderSide.Ask ? 1 : -1;

        return unSorted.sortBy(o => direction * o.price);
    }

    private directBuy(bid: DirectBuy): TradeExecutedEvent {
        const ask = this.asks.find(o => o.id === bid.askId);

        if (ask.userId === bid.userId) {
            throw new Error('Unable to direct buy your own bid');
        }
        if (ask.volume.lt(bid.volume)) {
            throw new Error('Remaining volume is too low');
        }
        if (ask.price !== bid.price) {
            throw new Error('Unexpected price change');
        }

        const updated = ask.updateWithTradedVolume(bid.volume);
        this.asks = this.updateOrder(this.asks, updated);

        const trade = new Trade(bid, updated, bid.volume, bid.price);

        return { trade, ask: updated, bid };
    }

    private match() {
        let executedTrades = List<TradeExecutedEvent>();

        this.bids.forEach(bid => {
            const executed = this.generateTrades(bid);
            if (executed.isEmpty()) {
                return true;
            }

            this.updateOrderBook(executed);

            executedTrades = executedTrades.concat(executed);

            return true;
        });

        return executedTrades;
    }

    private cancel(orderId: string): StatusChangedEvent {
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
            status: OrderStatus.Cancelled,
            prevStatus: OrderStatus.PendingCancellation
        };
    }

    private findAndRemove<T extends Order>(
        source: List<T>,
        orderId: string
    ): { result: boolean; modified?: List<T> } {
        const key = source.findKey(o => o.id === orderId);

        return key !== undefined
            ? { result: true, modified: source.remove(key) }
            : { result: false };
    }

    private updateOrder<T extends Order>(source: List<T>, order: T) {
        return source.set(
            source.findIndex(o => o.id === order.id),
            order
        );
    }

    private updateOrderBook(matched: List<TradeExecutedEvent>) {
        matched.forEach(m => {
            this.asks = this.updateOrder(this.asks, m.ask);
            this.bids = this.updateOrder(this.bids, m.bid);
        });
    }

    private cleanOrderBook() {
        this.asks = this.asks.filterNot(ask => ask.status === OrderStatus.Filled);
        this.bids = this.bids.filterNot(bid => bid.status === OrderStatus.Filled);
    }

    private generateTrades(bid: Bid) {
        let executed = List<TradeExecutedEvent>();

        this.asks.forEach(ask => {
            const isMatching = this.matches(bid, ask);
            const isFilled = bid.volume.isZero();
            const isOwned = bid.userId === ask.userId;

            if (!isMatching || isFilled || isOwned) {
                return false;
            }

            const filled = BN.min(ask.volume, bid.volume);

            executed = executed.concat({
                trade: new Trade(bid, ask, filled, ask.price),
                ask: ask.updateWithTradedVolume(filled),
                bid: bid.updateWithTradedVolume(filled)
            });

            return true;
        });

        return executed;
    }

    private matches(bid: Bid, ask: Ask) {
        const hasProductMatched = bid.matches(ask, this.deviceService, this.locationService);
        const hasVolume = !ask.volume.isNeg() && !ask.volume.isZero();
        const hasPriceMatched = ask.price <= bid.price;

        return hasPriceMatched && hasVolume && hasProductMatched;
    }
}
