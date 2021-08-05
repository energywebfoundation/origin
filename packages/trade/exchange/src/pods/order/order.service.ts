import { ActionResult, ActionResultEvent, OrderSide, OrderStatus } from '@energyweb/exchange-core';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { List } from 'immutable';
import { EntityManager, Repository } from 'typeorm';

import { ForbiddenActionError, UnknownEntityError } from '../../utils/exceptions';
import { CancelOrderCommand } from './commands/cancel-order.command';
import { SubmitOrderCommand } from './commands/submit-order.command';
import { CreateAskDTO } from './create-ask.dto';
import { CreateBidDTO } from './create-bid.dto';
import { DirectBuyDTO } from './direct-buy.dto';
import { InsufficientAssetsAvailable } from './errors/insufficient-assets-available.error';
import { OrderType } from './order-type.enum';
import { Order } from './order.entity';
import { GetProductQuery } from './queries/get-product.query';
import { HasEnoughAssetAmountQuery } from './queries/has-enough-asset-amount.query';

@Injectable()
export class OrderService<TProduct> {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private readonly repository: Repository<Order>,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus
    ) {}

    public async createBid(userId: string, bid: CreateBidDTO<TProduct>): Promise<Order> {
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

        await this.commandBus.execute(new SubmitOrderCommand(order));

        return new Order(order);
    }

    public async createDemandBids(
        userId: string,
        bids: CreateBidDTO<TProduct>[],
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

    public async createAsk(userId: string, ask: CreateAskDTO, product?: TProduct): Promise<Order> {
        this.logger.debug(
            `Requested ask creation for user:${userId} ask:${JSON.stringify(
                ask
            )} product:${JSON.stringify(product)}`
        );

        const hasEnoughAssetAmount = await this.queryBus.execute<
            HasEnoughAssetAmountQuery,
            boolean
        >(
            new HasEnoughAssetAmountQuery(userId, [
                {
                    id: ask.assetId,
                    amount: new BN(ask.volume)
                }
            ])
        );

        if (!hasEnoughAssetAmount) {
            throw new InsufficientAssetsAvailable(ask.assetId);
        }

        const resolvedProduct =
            product ??
            (await this.queryBus.execute<GetProductQuery, TProduct>(
                new GetProductQuery(ask.assetId)
            ));

        const order = await this.repository.save({
            userId,
            validFrom: new Date(ask.validFrom),
            product: resolvedProduct,
            side: OrderSide.Ask,
            status: OrderStatus.Active,
            startVolume: new BN(ask.volume),
            currentVolume: new BN(ask.volume),
            asset: { id: ask.assetId },
            price: ask.price
        });

        await this.commandBus.execute(new SubmitOrderCommand(order));

        return new Order(order);
    }

    public async createDirectBuy(userId: string, buyAsk: DirectBuyDTO): Promise<Order> {
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

        await this.commandBus.execute(new SubmitOrderCommand(order));

        return new Order(order);
    }

    public async cancelOrder(
        userId: string,
        orderId: string,
        allowDemandOrders = false
    ): Promise<Order> {
        const order = await this.findOne(userId, orderId);
        if (!order) {
            throw new UnknownEntityError(orderId);
        }

        if (!allowDemandOrders && order.demandId) {
            this.logger.error(
                `Order ${orderId} is a part of the demand and cannot be cancelled individually`
            );
            throw new ForbiddenActionError('Unable to cancel bids that are part of the demand');
        }

        await this.repository.update(orderId, { status: OrderStatus.PendingCancellation });

        await this.commandBus.execute(new CancelOrderCommand(orderId));

        return new Order({ ...order, status: OrderStatus.PendingCancellation });
    }

    public async submit(order: Order): Promise<void> {
        this.logger.debug(`Submitting order: ${order.id}`);

        await this.commandBus.execute(new SubmitOrderCommand(order));
    }

    public async getAllOrders(userId: string): Promise<Order[]> {
        return this.repository.find({
            where: { userId }
        });
    }

    public async getAllActiveOrders(): Promise<Order[]> {
        this.logger.debug(`Requested all active orders`);

        const orders = await this.repository.find({
            where: [{ status: OrderStatus.Active }, { status: OrderStatus.PartiallyFilled }]
        });

        this.logger.debug(`Found ${orders?.length} active orders`);

        return orders;
    }

    public async findOne(userId: string, orderId: string): Promise<Order> {
        return this.repository.findOne(orderId, { where: { userId } });
    }

    public async getActiveOrders(userId: string): Promise<Order[]> {
        return this.repository.find({
            where: [
                { status: OrderStatus.Active, userId },
                { status: OrderStatus.PartiallyFilled, userId }
            ]
        });
    }

    public async getActiveOrdersBySide(userId: string, side: OrderSide): Promise<Order[]> {
        return this.repository.find({
            where: [
                { status: OrderStatus.Active, userId, side },
                { status: OrderStatus.PartiallyFilled, userId, side }
            ]
        });
    }

    public async persistOrderStatusChange(actionResults: List<ActionResultEvent>): Promise<void> {
        actionResults.forEach(async (actionResult) => {
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

    public async reactivateOrder(order: Order): Promise<void> {
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

        await this.commandBus.execute(new SubmitOrderCommand(updated));
    }

    private updateStatus(orderId: string, status: OrderStatus) {
        return this.repository.update(orderId, { status });
    }
}
