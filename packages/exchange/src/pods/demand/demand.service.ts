import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { OrderService } from '../order/order.service';
import { ProductDTO } from '../order/product.dto';
import { Demand } from './demand.entity';

@Injectable()
export class DemandService {
    constructor(
        @InjectRepository(Demand)
        private readonly repository: Repository<Demand>,
        private readonly orderService: OrderService,
        private readonly matchingService: MatchingEngineService
    ) {}

    public async createSingle(
        userId: string,
        price: number,
        volume: number,
        product: ProductDTO,
        start: Date
    ) {
        const bid = await this.orderService.createBid({
            price,
            volume,
            validFrom: start,
            product: ProductDTO.toProduct(product),
            userId
        });

        const demand = await this.repository
            .create({
                userId,
                price,
                volumePerPeriod: volume,
                periods: 1,
                product: ProductDTO.toProduct(product),
                start: start.getTime(),
                bids: [bid]
            })
            .save();

        this.matchingService.submit(bid);

        return this.findOne(userId, demand.id);
    }

    public async findOne(userId: string, id: string) {
        const demand = await this.repository.findOne(id, { where: { userId } });
        if (!demand) {
            return null;
        }

        return { ...demand, trades: demand.trades.map(trade => trade.withMaskedOrder(userId)) };
    }

    public async getAll(userId: string) {
        const demands = await this.repository.find({ where: { userId } });
        if (!demands) {
            return null;
        }

        return demands.map(demand => ({
            ...demand,
            trades: demand.trades.map(trade => trade.withMaskedOrder(userId))
        }));
    }
}
