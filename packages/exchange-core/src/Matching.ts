import { List } from 'immutable';
import { Subject } from 'rxjs';
import { IRECDeviceService } from '@energyweb/utils-general';

import { OrderSide, Order, OrderStatus } from './Order';
import { Trade } from './Trade';

export type Listener<T> = (entity: T) => void;

type ExecutedTrade = { trade: Trade; askKey: number; bidKey: number; isPartial: boolean };

export class Matching {
    private deviceService = new IRECDeviceService();

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
        let result: ExecutedTrade[] = [];
        this.cancel();

        this.bids.forEach((bid, key) => {
            const executed = this.generateTrades(bid, key);
            if (!executed.length) {
                return false;
            }

            this.updateOrderBook(executed);
            result = result.concat(executed);

            return true;
        });

        this.cleanOrderBook();

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

    private updateOrderBook(matched: ExecutedTrade[]) {
        matched.forEach(m => {
            this.asks = this.asks.update(m.askKey, order => order.updateVolume(m.trade.volume));
            this.bids = this.bids.update(m.bidKey, order => order.updateVolume(m.trade.volume));
        });
    }

    private cleanOrderBook() {
        this.asks = this.asks.filterNot(ask => ask.status === OrderStatus.Filled);
        this.bids = this.bids.filterNot(bid => bid.status === OrderStatus.Filled);
    }

    private generateTrades(bid: Order, bidKey: number) {
        const executed: ExecutedTrade[] = [];
        let missing = bid.volume;

        this.asks.forEach((ask, key) => {
            const hasProductMatched = bid.matches(ask, this.deviceService);
            const hasVolume = ask.volume > 0;
            const hasPriceMatched = ask.price <= bid.price;
            const notFilled = missing > 0;

            if (hasPriceMatched && hasVolume && notFilled && hasProductMatched) {
                const isPartial = missing < ask.volume;
                const filled = isPartial ? ask.volume - missing : ask.volume;
                missing -= filled;

                executed.push({
                    trade: new Trade(bid, ask, filled, ask.price),
                    askKey: key,
                    bidKey,
                    isPartial
                });

                return true;
            }

            return false;
        });

        return executed;
    }
}
