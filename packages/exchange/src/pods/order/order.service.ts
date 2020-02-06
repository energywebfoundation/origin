import { OrderStatus, OrderSide } from '@energyweb/exchange-core';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { CreateBidDTO } from './create-bid.dto';
import { Order } from './order.entity';
import { AccountService } from '../account/account.service';
import { CreateAskDTO } from './create-ask.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly repository: Repository<Order>,
        private readonly matchingEngineService: MatchingEngineService,
        @Inject(forwardRef(() => AccountService))
        private readonly accountService: AccountService
    ) {}

    public async createBid(bid: CreateBidDTO) {
        return this.repository
            .create({
                ...bid,
                side: OrderSide.Bid,
                status: OrderStatus.Active,
                startVolume: bid.volume,
                currentVolume: bid.volume
            })
            .save();
    }

    public async createAsk(ask: CreateAskDTO) {
        if (!this.accountService.hasEnoughAssetAmount(ask.userId, ask.assetId, ask.volume)) {
            throw new Error('Not enough assets');
        }

        return this.repository
            .create({
                ...ask,
                side: OrderSide.Ask,
                status: OrderStatus.Active,
                startVolume: ask.volume,
                currentVolume: ask.volume,
                asset: { id: ask.assetId }
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

    public async getActiveOrders(userId: string) {
        return this.repository.find({
            where: [
                { status: OrderStatus.Active, userId },
                { status: OrderStatus.PartiallyFilled, userId }
            ]
        });
    }

    public async getActiveOrdersBySide(userId: string, side: OrderSide) {
        return this.repository.find({
            where: [
                { status: OrderStatus.Active, userId, side },
                { status: OrderStatus.PartiallyFilled, userId, side }
            ]
        });
    }
}
