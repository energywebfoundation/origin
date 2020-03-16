import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { OrderService } from '../order/order.service';
import { ProductDTO } from '../order/product.dto';
import { Demand } from './demand.entity';

@Injectable()
export class DemandService {
    private readonly logger = new Logger(DemandService.name);

    constructor(
        @InjectRepository(Demand, 'ExchangeConnection')
        private readonly repository: Repository<Demand>,
        private readonly orderService: OrderService,
        private readonly matchingService: MatchingEngineService
    ) {}

    public async createSingle(
        userId: string,
        price: number,
        volume: string,
        product: ProductDTO,
        start: Date
    ) {
        // TODO: in same transaction, add with complex demands implementation
        const demand = await this.repository.save({
            userId,
            price,
            volumePerPeriod: new BN(volume),
            periods: 1,
            product,
            start
        });

        const bid = await this.orderService.createDemandBid(
            userId,
            {
                price,
                volume,
                validFrom: start.toISOString(),
                product
            },
            demand.id
        );

        this.matchingService.submit(bid);

        return this.findOne(userId, demand.id);
    }

    public async findOne(userId: string, id: string) {
        return this.repository.findOne(id, { where: { userId } });
    }

    public async getAll(userId: string) {
        return this.repository.find({ where: { userId } });
    }
}
