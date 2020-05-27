import { TradeExecutedEvent } from '@energyweb/exchange-core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from 'immutable';
import { Connection, Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { Order } from '../order/order.entity';
import { Trade } from './trade.entity';
import { OrderStatus } from '../order/order-status.enum';
import { MessageService } from '../message/message.service';

@Injectable()
export class TradeService {
    private readonly logger = new Logger(TradeService.name);

    private readonly tradeTopic: string;

    constructor(
        private readonly connection: Connection,
        @InjectRepository(Trade)
        private readonly repository: Repository<Trade>,
        private readonly messageService: MessageService,
        private readonly configService: ConfigService
    ) {
        this.tradeTopic = this.configService.get<string>('QUEUE_TOPIC_TRADE');
    }

    public async persist(event: List<TradeExecutedEvent>) {
        const persistedId: string[] = [];

        this.logger.log(`Persisting trades and updating orders: ${event.size}`);
        this.logger.debug(`Persisting trades and updating orders: ${JSON.stringify(event)}`);

        return this.connection.transaction(async (entityManager) => {
            for (const { bid, ask, trade } of event) {
                await entityManager.update<Order>(Order, ask.id, {
                    currentVolume: ask.volume,
                    status: ask.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.volume.isZero() ? OrderStatus.Filled : OrderStatus.PartiallyFilled
                });
                const { identifiers } = await entityManager.insert<Trade>(Trade, {
                    created: trade.created,
                    price: trade.price,
                    volume: trade.volume,
                    bid,
                    ask
                });

                persistedId.push(identifiers[0].id);
            }
            this.logger.debug(`Persisting trades and orders completed`);

            const persistedTrades = await entityManager.findByIds(Trade, persistedId);
            this.messageService.publish(JSON.stringify(persistedTrades), this.tradeTopic);
        });
    }

    public async getAll(userId: string, maskOrders = true) {
        const trades = await this.repository
            .createQueryBuilder('trade')
            .leftJoinAndSelect('trade.bid', 'bid')
            .leftJoinAndSelect('trade.ask', 'ask')
            .leftJoinAndSelect('ask.asset', 'asset')
            .where('ask.userId = :userId OR bid.userId = :userId', { userId })
            .getMany();

        return maskOrders ? trades.map((trade) => trade.withMaskedOrder(userId)) : trades;
    }
}
