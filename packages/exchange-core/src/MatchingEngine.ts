import { List } from 'immutable';
import { Subject } from 'rxjs';
import { IRECDeviceService, LocationService } from '@energyweb/utils-general';

import { OrderSide, Order, OrderStatus } from './Order';
import { Trade } from './Trade';
import { Product } from './Product';
import { Bid } from './Bid';
import { Ask } from './Ask';

export type Listener<T> = (entity: T) => void;

type ExecutedTrade = { trade: Trade; askKey: number; bidKey: number; isPartial: boolean };

export class MatchingEngine {
    private deviceService = new IRECDeviceService();

    private locationService = new LocationService();

    private bids: List<Bid> = List<Bid>();

    private asks: List<Ask> = List<Ask>();

    public trades = new Subject<List<Trade>>();

    public cancellationQueue = List<string>();

    public submitOrder(order: Order) {
        if (order.side === OrderSide.Ask) {
            this.asks = this.insert(this.asks, order as Ask);
        } else {
            this.bids = this.insert(this.bids, order as Bid);
        }
    }

    public cancelOrder(id: string) {
        this.cancellationQueue = this.cancellationQueue.concat(id);
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
        const trades = this.match();
        if (!trades.isEmpty()) {
            this.trades.next(trades);
        }
    }

    private insert<T extends Order>(orderBook: List<T>, order: T) {
        const unSorted = orderBook.concat(order);
        const direction = order.side === OrderSide.Ask ? 1 : -1;

        return unSorted.sortBy(o => direction * o.price);
    }

    private match() {
        let result = List<ExecutedTrade>();
        this.cancel();

        this.bids.forEach((bid, key) => {
            const executed = this.generateTrades(bid, key);
            if (executed.isEmpty()) {
                return false;
            }

            this.updateOrderBook(executed);
            result = result.concat(executed);

            return true;
        });

        this.cleanOrderBook();

        return result.map(m => m.trade);
    }

    private cancel() {
        this.cancellationQueue.forEach(id => {
            const bidKey = this.bids.findKey(bid => bid.id === id);

            if (bidKey !== undefined) {
                this.bids = this.bids.remove(bidKey);
            } else {
                const askKey = this.asks.findKey(ask => ask.id === id);
                if (askKey !== undefined) {
                    this.asks = this.asks.remove(askKey);
                }
            }
        });
        this.cancellationQueue = List<string>();
    }

    private updateOrderBook(matched: List<ExecutedTrade>) {
        matched.forEach(m => {
            this.asks = this.asks.update(m.askKey, order => order.updateVolume(m.trade.volume));
            this.bids = this.bids.update(m.bidKey, order => order.updateVolume(m.trade.volume));
        });
    }

    private cleanOrderBook() {
        this.asks = this.asks.filterNot(ask => ask.status === OrderStatus.Filled);
        this.bids = this.bids.filterNot(bid => bid.status === OrderStatus.Filled);
    }

    private generateTrades(bid: Bid, bidKey: number) {
        let executed = List<ExecutedTrade>();
        let missing = bid.volume;

        this.asks.forEach((ask, key) => {
            const isMatching = this.matches(bid, ask);
            const isFilled = missing === 0;

            if (!isMatching || isFilled) {
                return false;
            }

            const isPartial = missing < ask.volume;
            const filled = isPartial ? ask.volume - missing : ask.volume;
            missing -= filled;

            executed = executed.push({
                trade: new Trade(bid, ask, filled, ask.price),
                askKey: key,
                bidKey,
                isPartial
            });

            return true;
        });

        return executed;
    }

    private matches(bid: Bid, ask: Ask) {
        const hasProductMatched = bid.matches(ask, this.deviceService, this.locationService);
        const hasVolume = ask.volume > 0;
        const hasPriceMatched = ask.price <= bid.price;

        return hasPriceMatched && hasVolume && hasProductMatched;
    }
}
