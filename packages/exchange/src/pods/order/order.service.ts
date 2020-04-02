import { OrderSide, ActionResultEvent, ActionResult } from '@energyweb/exchange-core';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { List } from 'immutable';
import { EntityManager, Repository } from 'typeorm';

import { UnknownEntityError } from '../../utils/exceptions';
import { AccountBalanceService } from '../account-balance/account-balance.service';
import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { ProductService } from '../product/product.service';
import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { DirectBuyDTO } from './direct-buy.dto';
import { OrderType } from './order-type.enum';
import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order, 'ExchangeConnection')
        private readonly repository: Repository<Order>,
        @Inject(forwardRef(() => MatchingEngineService))
        private readonly matchingEngineService: MatchingEngineService,
        @Inject(forwardRef(() => AccountBalanceService))
        private readonly accountBalanceService: AccountBalanceService,
        private readonly productService: ProductService
    ) {}

    public async createBid(userId: string, bid: CreateBidDTO): Promise<Order> {
        this.logger.debug(`Requested bid creation for user:${userId} bid:${JSON.stringify(bid)}`);

        const order = await this.repository.save({
            userId,
            validFrom: new Date(bid.validFrom),
            side: OrderSide.Bid,
            status: OrderStatus.Active,
            startVolume: new BN(bid.volume),
            currentVolume: new BN(bid.volume),
            price: bid.price,
            product: bid.product
        });

        this.matchingEngineService.submit(order);

        return order;
    }

    public async createDemandBids(
        userId: string,
        bids: CreateBidDTO[],
        demandId: string,
        transaction: EntityManager
    ): Promise<Order[]> {
        this.logger.debug(
            `Requested demand bids creation for user:${userId} bid:${JSON.stringify(bids)}`
        );

        const repository = transaction.getRepository<Order>(Order);

        const orders: Order[] = [];

        for (const bid of bids) {
            const order = await repository.save({
                userId,
                validFrom: new Date(bid.validFrom),
                side: OrderSide.Bid,
                status: OrderStatus.Active,
                startVolume: new BN(bid.volume),
                currentVolume: new BN(bid.volume),
                price: bid.price,
                product: bid.product,
                demand: { id: demandId }
            });
            orders.push(new Order(order));
        }

        return orders;
    }

    public async createAsk(userId: string, ask: CreateAskDTO): Promise<Order> {
        this.logger.debug(`Requested ask creation for user:${userId} ask:${JSON.stringify(ask)}`);

        if (
            !(await this.accountBalanceService.hasEnoughAssetAmount(
                userId,
                ask.assetId,
                ask.volume
            ))
        ) {
            throw new Error('Not enough assets');
        }

        const product = await this.productService.getProduct(ask.assetId);

        const order = await this.repository.save({
            userId,
            validFrom: new Date(ask.validFrom),
            product,
            side: OrderSide.Ask,
            status: OrderStatus.Active,
            startVolume: new BN(ask.volume),
            currentVolume: new BN(ask.volume),
            asset: { id: ask.assetId },
            price: ask.price
        });

        this.matchingEngineService.submit(order);

        return order;
    }

    public async createDirectBuy(userId: string, buyAsk: DirectBuyDTO) {
        const ask = await this.repository.findOne(buyAsk.askId, { where: { side: OrderSide.Ask } });
        if (!ask || ask.userId === userId) {
            throw new Error('Ask does not exist or owned by the user');
        }

        const order = await this.repository.save({
            userId,
            validFrom: new Date(),
            side: OrderSide.Bid,
            status: OrderStatus.Active,
            type: OrderType.Direct,
            startVolume: new BN(buyAsk.volume),
            currentVolume: new BN(buyAsk.volume),
            price: buyAsk.price,
            directBuyId: buyAsk.askId,
            product: {}
        });

        this.matchingEngineService.submit(order);

        return new Order(order);
    }

    public async cancelOrder(userId: string, orderId: string) {
        const order = await this.findOne(userId, orderId);
        if (!order) {
            throw new UnknownEntityError(orderId);
        }

        await this.repository.update(orderId, { status: OrderStatus.PendingCancellation });

        this.matchingEngineService.cancel(orderId);

        return new Order({ ...order, status: OrderStatus.PendingCancellation });
    }

    public async submit(order: Order) {
        this.logger.debug(`Submitting order:${JSON.stringify(order)}`);

        this.matchingEngineService.submit(order);
    }

    public async getAllOrders(userId: string) {
        return this.repository.find({
            where: { userId }
        });
    }

    public async getAllActiveOrders() {
        this.logger.debug(`Requested all active orders`);

        const orders = await this.repository.find({
            where: [{ status: OrderStatus.Active }, { status: OrderStatus.PartiallyFilled }]
        });

        this.logger.debug(`Found ${orders?.length} active orders`);

        return orders;
    }

    public async findOne(userId: string, orderId: string) {
        return this.repository.findOne(orderId, { where: { userId } });
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

    public async persistOrderStatusChange(actionResults: List<ActionResultEvent>) {
        actionResults.forEach(async actionResult => {
            this.logger.debug(`Updating status for ${JSON.stringify(actionResult)}`);
            try {
                if (actionResult.result !== ActionResult.Cancelled) {
                    return;
                }

                await this.updateStatus(actionResult.orderId, OrderStatus.Cancelled);
            } catch (e) {
                this.logger.error(`Unexpected error ${e.message}`);
            }
        });
    }

    public async reactivateOrder(order: Order) {
        if (
            order.status !== OrderStatus.Cancelled &&
            order.status !== OrderStatus.PendingCancellation
        ) {
            throw new Error(
                'Unable to reactive order in state other than Cancelled or PendingCancellation'
            );
        }

        await this.updateStatus(order.id, OrderStatus.Active);
        const updated = await this.findOne(order.userId, order.id);

        this.matchingEngineService.submit(updated);
    }

    private updateStatus(orderId: string, status: OrderStatus) {
        return this.repository.update(orderId, { status });
    }
}
