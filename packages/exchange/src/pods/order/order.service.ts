import { OrderStatus, OrderSide } from '@energyweb/exchange-core';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { CreateBidDTO } from './create-bid.dto';
import { Order } from './order.entity';
import { CreateAskDTO } from './create-ask.dto';
import { ProductService } from '../product/product.service';
import { AssetService } from '../asset/asset.service';
import { AccountBalanceService } from '../account-balance/account-balance.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order, 'ExchangeConnection')
        private readonly repository: Repository<Order>,
        private readonly matchingEngineService: MatchingEngineService,
        @Inject(forwardRef(() => AccountBalanceService))
        private readonly accountBalanceService: AccountBalanceService,
        private readonly productService: ProductService,
        private readonly assetService: AssetService
    ) {}

    public async createBid(bid: CreateBidDTO) {
        return this.repository.save({
            ...bid,
            validFrom: new Date(bid.validFrom),
            side: OrderSide.Bid,
            status: OrderStatus.Active,
            startVolume: bid.volume,
            currentVolume: bid.volume
        });
    }

    public async createAsk(ask: CreateAskDTO) {
        if (
            !(await this.accountBalanceService.hasEnoughAssetAmount(
                ask.userId,
                ask.assetId,
                ask.volume.toString()
            ))
        ) {
            throw new Error('Not enough assets');
        }

        const { deviceId } = await this.assetService.get(ask.assetId);
        const product = await this.productService.getProduct(deviceId);

        return this.repository.save({
            ...ask,
            validFrom: new Date(ask.validFrom),
            product,
            side: OrderSide.Ask,
            status: OrderStatus.Active,
            startVolume: ask.volume,
            currentVolume: ask.volume,
            asset: { id: ask.assetId }
        });
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
