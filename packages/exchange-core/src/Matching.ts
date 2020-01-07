import { List } from 'immutable';
import { Subject } from 'rxjs';

import { OrderSide, Order, OrderStatus } from './Order';
import { Trade } from './Trade';

export type Listener<T> = (entity: T) => void;

type TradeExecuted = { trade: Trade; askKey: number; isPartial: boolean };

export class Matching {
    private bids: List<Order> = List<Order>();

    private asks: List<Order> = List<Order>();

    public trades = new Subject<List<Trade>>();

    public cancellationQueue = List<string>();

    public submitOrder(order: Order) {
        if (order.side === OrderSide.Ask) {
            this.asks = this.insert(this.asks, order);
        } else {
            this.bids = this.insert(this.bids, order);
        }
    }

    public cancelOrder(id: string) {
        this.cancellationQueue = this.cancellationQueue.concat(id);
    }

    public orderBook() {
        return { asks: this.asks, bids: this.bids };
    }

    public tick() {
        const trades = this.match();
        if (!trades.isEmpty()) {
            this.trades.next(trades);
        }
    }

    private insert(orderBook: List<Order>, order: Order) {
        const unSorted = orderBook.concat(order);
        const direction = order.side === OrderSide.Ask ? 1 : -1;

        return unSorted.sortBy(o => direction * o.price);
    }

    private match() {
        let result: TradeExecuted[] = [];
        this.cancel();

        this.bids.forEach(bid => {
            const { matched, isFilled, missing } = this.generateTrades(bid);

            this.updateAsks(matched);
            this.updateBids(missing, isFilled);

            result = result.concat(matched);

            return isFilled;
        });
        return List(result.map(m => m.trade));
    }

    private cancel() {
        this.cancellationQueue.forEach(id => {
            const bidKey = this.bids.findKey(bid => bid.id === id);
            if (bidKey !== undefined) {
                this.bids = this.bids.remove(bidKey);
            } else {
                const askKey = this.asks.findKey(ask => ask.id === id);
                this.asks = this.asks.remove(askKey);
            }
        });
        this.cancellationQueue = List<string>();
    }

    private updateAsks(matched: TradeExecuted[]) {
        matched.forEach(m => {
            if (m.isPartial) {
                const { volume } = this.asks.get(m.askKey);
                this.asks = this.setVolume(this.asks, m.askKey, volume - m.trade.volume);
                this.asks = this.setStatus(this.asks, m.askKey, OrderStatus.PartiallyFilled);
            } else {
                this.asks = this.setStatus(this.asks, m.askKey, OrderStatus.Filled);
            }
        });

        this.asks = this.asks.filterNot(ask => ask.status === OrderStatus.Filled);
    }

    private setVolume(side: List<Order>, key: number, volume: number) {
        return side.setIn([key, 'volume'], volume);
    }

    private setStatus(side: List<Order>, key: number, status: OrderStatus) {
        return side.setIn([key, 'status'], status);
    }

    private updateBids(missing: number, isFilled: boolean) {
        if (isFilled) {
            this.bids = this.bids.shift();
        } else {
            this.bids = this.bids.setIn([0, 'volume'], missing);
            this.bids = this.setStatus(this.bids, 0, OrderStatus.PartiallyFilled);
        }
    }

    private generateTrades(bid: Order) {
        const matched: TradeExecuted[] = [];

        let missing = bid.volume;
        this.asks.forEach((ask, key) => {
            if (ask.price <= bid.price && missing > 0) {
                const isPartial = missing < ask.volume;
                const filled = isPartial ? ask.volume - missing : ask.volume;
                missing -= filled;

                matched.push({
                    trade: new Trade(bid, ask, filled, ask.price),
                    askKey: key,
                    isPartial
                });

                return true;
            }

            return false;
        });

        return { matched, isFilled: missing === 0, missing };
    }
}
