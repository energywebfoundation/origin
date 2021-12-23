# Exchange Core - @energyweb/exchange-core
[**Source code on GitHub**](https://github.com/energywebfoundation/origin/tree/master/packages/trade/exchange-core) 

## Overview
The Exchange Core package provides the [Matching Engine class](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts), which provides the Exchange's order book functionality. It processes [orders](../user-guide-glossary.md#order) (which can be [bids](../user-guide-glossary.md#bid), [asks](../user-guide-glossary.md#ask), or [direct buys](../user-guide-glossary.md#direct-buy) that are submitted by users from the exchange.  

When a new bid or ask is submitted, the Matching Engine will compare it to all active orders in the [order book](../user-guide-glossary.md#order-book) to see if there is a match, and if so, will execute a trade. In order to create a trade, an ask and bid have to be matched. An ask can only be matched with a bid if all the matching criteria explained above are met. See the source code for the Matching Engine class [here](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts#L85).  

## Matching Engine Parameters and Initialization
The Matching Engine is a [generic class](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-classes) that takes in two parameters, **TProduct** and **TProductFilter**. The parameters are generic so that developers can provide their own implementation of Product and Product Filters based on implementation needs. 

```
export class MatchingEngine<TProduct, TProductFilter>
```
[source](https://github.com/energywebfoundation/origin/blob/6e510dca5f934b6b17ea5a43304d444c3499b62f/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L24)

### Product
TProduct represents the product being traded - in the case of the Origin reference implementation, an [Energy Attribute Certificate (EAC)](../user-guide-glossary.md#energy-attribute-certificate) - so the implemented product type contains EAC attributes such as device type, location, generation time, grid operator etc. The interface can change according to implementation requirements. 

### Product Filter
TProductFilter represents the product filters in a bid or ask. Products can be filtered by, for example, a specific fuel type or a specific region where the energy represented by an EAC was produced. These filters can change according to implementation requirements. 

### Price Strategy
The Matching Engine is instantiated with a price strategy:
```
   constructor(
        private readonly priceStrategy: IPriceStrategy,
        private logger: LoggerService = new Logger(MatchingEngine.name)
    ) 
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange-core/src/MatchingEngine.ts#L55)  

The price strategy is [fetched from the config file's EXCHANGE_PRICE_STRATEGY key in the Matching Engine service](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L48). **It must be set, otherwise an error will be thrown.** 

Both price strategy classes have a pickPrice method that allows the Matching Engine to determine the trade price:

#### Ask Price Strategy
Always use the [ask](../user-guide-glossary.md#ask) price:
```
export class AskPriceStrategy implements IPriceStrategy {
    pickPrice(ask: IOrder, bid: IOrder): number {
        return ask.price;
    }
}
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/strategy/AskPriceStrategy.ts)

#### Order Creation TimePick Strategy
If the [bid](../user-guide-glossary.md#bid) price was created first, use the bid price. Otherwise, use the ask price: 
```
export class OrderCreationTimePickStrategy implements IPriceStrategy {
    pickPrice(ask: IOrder, bid: IOrder): number {
        return ask.createdAt > bid.createdAt ? bid.price : ask.price;
    }
}
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/strategy/OrderCreationTimePickStrategy.ts)

## Order Book
The Matching Engine [creates the order book](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts#L85), which contains all of the Exchange's current bids and asks: 

```
public orderBook(): OrderBook<TProduct, TProductFilter> {
        const now = new Date();
        const validFromFilter = (order: IMatchableOrder<TProduct, TProductFilter>) =>
            order.validFrom <= now;

        return {
            asks: this.asks.filter(validFromFilter),
            bids: this.bids.filter(validFromFilter)
        };
    }
```
[source](https://github.com/energywebfoundation/origin/blob/a094ad0b0e6b36a609efd098f05b82994fcd4084/packages/trade/exchange-core/src/MatchingEngine.ts#L85)

## Matching Flow 
** Note that the matching flow pertains to bids and asks. The logic for handling Direct Buys is [described seperatley below](#adding-direct-buys). 

### 1. Submit Order to Matching Engine
The [Exchange module's matching engine service submits orders](https://github.com/energywebfoundation/origin/blob/73d30845f6c57684bdbc1e95f6bb3b80b5ff2770/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L71) to the Matching Engine. Orders that are submitted to the Matching Engine order book must be of type [IMatchableOrder](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/IMatchableOrder.ts).  

The [OrderMapperService](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/test/order/order-mapper.service.ts) in the Exchange package maps orders to instances of the [Order class](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/Order.ts), which implements the IMatchableOrder interface.  

After mapping, the [SubmitOrderHandler](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/matching-engine/handlers/submit-order.handler.ts) posts the Order to the Matching Engine.  

Once submitted to the Matching Engine, Orders are placed in the Pending Actions queue:

```
   public submitOrder(order: IMatchableOrder<TProduct, TProductFilter>): void {
        this.logger.debug(`Submitting order: ${order.id}`);
        this.pendingActions = this.pendingActions.concat({
            kind: ActionKind.AddOrder,
            value: order.clone()
        });
    }
```
[source](https://github.com/energywebfoundation/origin/blob/231ce006d7fc49b8bda44636bb8f48708e93a0b9/packages/trade/exchange-core/src/MatchingEngine.ts#L61)


### 2. Handle Queued Events 
All possible events that happen on the Exchange can be categorized into **trade events** and **status changes**.   

- Trade events are those that can result in the creation of a trade. 
- Status changes also have an effect on the exchange but do not ever result in a trade. 

Events are triggered by actions. [Adding orders](#adding-orders) and [adding direct buys](#adding-direct-buys) are actions that result in trading events while [canceling an order](#cancelling-orders) results in a status change. 

The exchange collects and queues all actions that are submitted in one tick into a pending action List.  One tick is the defined execution time frame of the exchange, and it’s [set to a one second interval by default in the Matching Engine Service using the config's EXCHANGE_MATCHING_INTERVAL setting](https://github.com/energywebfoundation/origin/blob/a9b0da027c75b76cb434652374cfbdd9211f9e0e/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L100).

```
private pendingActions = List<OrderBookAction<TProduct, TProductFilter>>();
```
[source](https://github.com/energywebfoundation/origin/blob/f8db6c42a425225a3b91e8e3b423a7224a842a0e/packages/trade/exchange-core/src/MatchingEngine.ts#L52)

 Order Book actions are of type [OrderBookAction](https://github.com/energywebfoundation/origin/blob/73d30845f6c57684bdbc1e95f6bb3b80b5ff2770/packages/trade/exchange-core/src/MatchingEngine.ts#L32). Order Book Actions consists of the Action Type (in the below code snippet, "ActionKind") and the Order itself. The Action Type can be 'add order', 'add direct buy', or 'cancel order', each of which are handled differently by the Matching Engine.  
 
 With every tick, all queued actions are executed one after the other:

```
public tick(): void {
        this.triggers.next(null);
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
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange-core/src/MatchingEngine.ts)  

### 3. Insert Bids and Asks to Order Book
When a new order (not a direct buy) is added, it is inserted into the order book on either the ask or bid side: 

```
  private insertOrder(order: IMatchableOrder<TProduct, TProductFilter>) {
        if (order.side === OrderSide.Ask) {
            this.asks = this.insert(this.asks, order);
        } else {
            this.bids = this.insert(this.bids, order);
        }
    }
```
[source](https://github.com/energywebfoundation/origin/blob/6e510dca5f934b6b17ea5a43304d444c3499b62f/packages/trade/exchange-core/src/MatchingEngine.ts#L116)

### 4. Check for Match
The Matching Engine checks if the new order matches with any existing orders in the order book. The matching works by comparing each existing ask and bid in the order book to see if they match based on the established matching criteria.  

You can read more detail about the matching criteria in the reference implementation [here](./matching-criteria). You can read more detail about Exchange scenarios and logic [here](https://energyweb.atlassian.net/wiki/spaces/OD/pages/1138360384/Exchange+scenarios).

```
private matches(
        bid: IMatchableOrder<TProduct, TProductFilter>,
        ask: IMatchableOrder<TProduct, TProductFilter>
    ) {
        const hasProductMatched = bid.matches(ask);
        const hasAskVolume = !ask.volume.isNeg() && !ask.isFilled;
        const hasBidVolume = !bid.volume.isNeg() && !bid.isFilled;
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
```
[source](https://github.com/energywebfoundation/origin/blob/6e510dca5f934b6b17ea5a43304d444c3499b62f/packages/trade/exchange-core/src/MatchingEngine.ts#L319) 

### 5. Handle Trade Scenario
Adding orders can result in the creation of a trade if the order matches with another one on the exchange. The bid and the ask's volumes are updated accordng to what amount was filled by the trade.

```
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
```
 If not, the order is just added to the order book and stays there until matched or canceled. If a match is found, a trade event occurs. 

```
         if (!trades.isEmpty()) {
            this.trades.next(trades.map((trade) => new TradeExecutedEvent(trade)));
        }
```
[source](https://github.com/energywebfoundation/origin/blob/db84284d244bdef13496ea2c647a30816a0bf0a9/packages/trade/exchange-core/src/MatchingEngine.ts#L180)

### 6. Broadcast Events
The trade and status change events that have been collected in the matching engine trigger operations in other parts of the system using asynchronous events and event listeners. Events and event  are facilitated by the [NestJS CQRS module](https://docs.nestjs.com/recipes/cqrs). 

The [Matching Engine Service](./exchange.md#matching-engine-service) in the Exchange package [subscribes to trade execution events](https://github.com/energywebfoundation/origin/blob/6e510dca5f934b6b17ea5a43304d444c3499b62f/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L63). 

When a trade occurs, the Matching Engine Service's event bus publishes a Bulk Trade Executed event:

```
    private async onTradeExecutedEvent(tradeEvents: List<TradeExecutedEvent>) {
        this.logger.log('Received TradeExecutedEvent event');

        const trades = tradeEvents.map<Trade>((t) => t.trade);

        this.publish(new BulkTradeExecutedEvent(trades));
    }
```
[source](https://github.com/energywebfoundation/origin/blob/6e510dca5f934b6b17ea5a43304d444c3499b62f/packages/trade/exchange/src/pods/matching-engine/matching-engine.service.ts#L122)

[The Bulk Trade Executed Event event handler](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/trade/trade-executed-event.handler.ts) is responsible for calling the the trade service method that handles the trade event by updating the the bid and ask and persisting the new values in the Trade Repository.  

For every trade event, the order volume of the bid and ask is updated depending on the traded volume and a trade is created. Each trade contains corresponding volume and price information and a reference to the bid and ask. Orders with filled volumes disappear from the exchange completely while partially filled remain on the order book but with an updated volume. 

```
    public async persist(event: List<Trade>) {
        this.logger.log(`Persisting trades and updating orders: ${event.size}`);
        this.logger.debug(`Persisting trades and updating orders: ${JSON.stringify(event)}`);

        const trades: string[] = [];

        await this.connection.transaction(async (entityManager) => {
            for (const trade of event) {
                const { ask, bid } = trade;
                await entityManager.update<Order>(Order, ask.id, {
                    currentVolume: ask.volume,
                    status: ask.isFilled ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.isFilled ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });

                const tradeToStore = new TradeEntity({
                    created: new Date(),
                    price: trade.price,
                    volume: trade.volume,
                    bid: { id: bid.id } as Order,
                    ask: { id: ask.id } as Order
                });
                await entityManager.insert<TradeEntity>(TradeEntity, tradeToStore);

                trades.push(tradeToStore.id);

                // This is to force each trade have unique created timestamp making the trades order deterministic
                await sleep(1);
            }
            this.logger.debug(`Persisting trades and orders completed`);
        });

        await this.handlePersistedTrades(trades);
    }
```
[source](https://github.com/energywebfoundation/origin/blob/master/packages/trade/exchange/src/pods/trade/trade.service.ts)

Created trades represent ownership changes in the exchange application. However, **there is no ownership change on the blockchain until a user withdraws the EACs from the exchange**. At this point, the EAC is no longer in the user's Exchange Account 

Orders with volumes that are not filled or only partially filled are active, while orders that are filled or canceled are no longer active. For every status change event, the order status is updated. If an order is canceled, the order status is changed to 'canceled' and is removed from the order book.   

Unexpected errors in the matching process that are collected through status change events e.g. in the case there has been a problem with the direct buy, trigger the order status to change to “Error” to reflect the problem in the matching engine. 


## Adding Direct Buys
A [direct buy](../user-guide-glossary.md#direct-buy) occurs when a user directly buys a certificate without submitting a bid. This means that the buyer can bypass the matching process. If a direct buy is added, the system creates a bid with price and EAC criteria that exactly match the ask’s criteria. The buyer can choose the desired volume but the volume cannot exceed the ask volume. 

A trade is directly created with the chosen ask, without triggering the regular matching technique of comparing each bid and ask. **This means that the bid is never really put on the exchange but the two orders are directly converted into a trade event. As a result, a direct buy is a separate action, compared to simple order creation, and is queued as a separate action type**.

```
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
```

 **A direct buy should always result in a trade event if no error occurs**. If there is an error, a status change event is logged that expresses this problem with the execution. 

## Cancelling Orders
The main action that results in a status change event is canceling an order. An order is canceled by finding the order by id and creating a status change event. All status changes are collected by the matching engine. 

```
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
```