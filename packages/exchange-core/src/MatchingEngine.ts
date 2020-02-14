import { List } from 'immutable';
import { Subject } from 'rxjs';
import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';

import { OrderSide, Order, OrderStatus } from './Order';
import { Trade } from './Trade';
import { Product } from './Product';
import { Bid } from './Bid';
import { Ask } from './Ask';

export type TradeExecutedEvent = { trade: Trade; ask: Ask; bid: Bid };

export class MatchingEngine {
    private bids: List<Bid> = List<Bid>();

    private asks: List<Ask> = List<Ask>();

    public trades = new Subject<List<TradeExecutedEvent>>();

    public cancellationQueue = List<string>();

    constructor(
        private readonly deviceService: IDeviceTypeService,
        private readonly locationService: ILocationService
    ) {}

    public submitOrder(order: Ask | Bid) {
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
        let executedTrades = List<TradeExecutedEvent>();
        this.cancel();

        this.bids.forEach(bid => {
            const executed = this.generateTrades(bid);
            if (executed.isEmpty()) {
                return false;
            }

            this.updateOrderBook(executed);

            executedTrades = executedTrades.concat(executed);

            return true;
        });

        this.cleanOrderBook();

        return executedTrades;
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

    private updateOrderBook(matched: List<TradeExecutedEvent>) {
        matched.forEach(m => {
            this.asks = this.asks.set(
                this.asks.findIndex(ask => ask.id === m.ask.id),
                m.ask
            );
            this.bids = this.bids.set(
                this.bids.findIndex(bid => bid.id === m.bid.id),
                m.bid
            );
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
            const isFilled = bid.volume === 0;

            if (!isMatching || isFilled) {
                return false;
            }

            const filled = Math.min(ask.volume, bid.volume);

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
        const hasVolume = ask.volume > 0;
        const hasPriceMatched = ask.price <= bid.price;

        return hasPriceMatched && hasVolume && hasProductMatched;
    }
}
