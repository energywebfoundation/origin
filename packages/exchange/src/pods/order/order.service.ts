import { OrderStatus } from '@energyweb/exchange-core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { CreateOrderDto } from './create-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly repository: Repository<Order>,
        private readonly matchingEngineService: MatchingEngineService
    ) {}

    public async create(newOrder: CreateOrderDto) {
        return this.repository
            .create({
                ...newOrder,
                status: OrderStatus.Active,
                startVolume: newOrder.volume,
                currentVolume: newOrder.volume
            })
            .save();
    }

    public async submit(order: Order) {
        this.matchingEngineService.submit(order);
    }

    public async getAllActiveOrders() {
        return this.repository.find({
            where: [{ status: OrderStatus.Active }, { status: OrderStatus.PartiallyFilled }]
        });
    }
}
