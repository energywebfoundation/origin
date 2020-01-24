import { TradeExecutedEvent } from '@energyweb/exchange-core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { List } from 'immutable';
import { Connection, Repository } from 'typeorm';

import { Order } from '../order/order.entity';
import { Trade } from './trade.entity';

@Injectable()
export class TradeService {
    private readonly logger = new Logger(TradeService.name);

    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        @InjectRepository(Trade)
        private readonly repository: Repository<Trade>
    ) {}

    public async persist(event: List<TradeExecutedEvent>) {
        this.logger.log(`Persisting trades and updating orders: ${event.size}`);

        return this.connection.transaction(async entityManager => {
            for (const { bid, ask, trade } of event) {
                await entityManager.update<Order>(Order, ask.id, {
                    currentVolume: ask.volume,
                    status: ask.status
                });
                await entityManager.update<Order>(Order, bid.id, {
                    currentVolume: bid.volume,
                    status: bid.status
                });
                await entityManager.insert<Trade>(Trade, {
                    ...trade,
                    bid,
                    ask
                });
            }
        });
    }

    public async findAll(userId: string) {
        return this.repository
            .createQueryBuilder('trade')
            .leftJoin('trade.bid', 'bid')
            .leftJoin('trade.ask', 'ask')
            .where('ask.userId = :userId OR bid.userId = :userId', { userId })
            .getMany();
    }
}
