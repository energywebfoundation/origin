import { DemandStatus } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { Connection, Repository } from 'typeorm';

import { OrderStatus } from '@energyweb/exchange-core';
import { ForbiddenActionError } from '../../utils/exceptions';
import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { CreateBidDTO } from '../order/create-bid.dto';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { CreateDemandDTO } from './create-demand.dto';
import { DemandTimePeriodService } from './demand-time-period.service';
import { Demand, IDemand } from './demand.entity';
import { DemandSummaryDTO } from './demand-summary.dto';

@Injectable()
export class DemandService {
    private readonly logger = new Logger(DemandService.name);

    constructor(
        @InjectRepository(Demand)
        private readonly repository: Repository<Demand>,
        private readonly orderService: OrderService,
        private readonly matchingService: MatchingEngineService,
        private readonly connection: Connection,
        private readonly demandTimePeriodService: DemandTimePeriodService
    ) {}

    public async create(userId: string, createDemand: CreateDemandDTO): Promise<Demand> {
        const bidsToCreate = this.prepareBids(createDemand);

        let demand: Demand;
        let bids: Order[];

        await this.connection.transaction(async (transaction) => {
            const repository = transaction.getRepository<Demand>(Demand);

            const demandToCreate: Omit<IDemand, 'id' | 'bids'> = {
                userId,
                price: createDemand.price,
                volumePerPeriod: new BN(createDemand.volumePerPeriod),
                periodTimeFrame: createDemand.periodTimeFrame,
                product: createDemand.product,
                start: createDemand.start,
                end: createDemand.end,
                status: DemandStatus.ACTIVE
            };

            demand = await repository.save(demandToCreate);

            bids = await this.orderService.createDemandBids(
                userId,
                bidsToCreate,
                demand.id,
                transaction
            );
        });

        bids.forEach((bid) => this.matchingService.submit(bid));

        return this.findOne(userId, demand.id);
    }

    public createSummary(createDemand: CreateDemandDTO): DemandSummaryDTO {
        const bids = this.prepareBids(createDemand);

        return new DemandSummaryDTO(bids);
    }

    public async pause(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (demand.status !== DemandStatus.ACTIVE) {
            throw new ForbiddenActionError(
                `Demand ${demand.id} expected status is DemandStatus.ACTIVE but had ${
                    DemandStatus[demand.status]
                }`
            );
        }

        await this.repository.update(demand.id, { status: DemandStatus.PAUSED });
        await this.cancelDemandBids(demand);

        return this.findOne(userId, demand.id);
    }

    public async archive(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (demand.status === DemandStatus.ARCHIVED || demand.status === DemandStatus.ACTIVE) {
            throw new ForbiddenActionError(
                `Demand ${demand.id} expected status is DemandStatus.PAUSED but had ${
                    DemandStatus[demand.status]
                }`
            );
        }

        await this.repository.update(demand.id, { status: DemandStatus.ARCHIVED });
        return this.findOne(userId, demand.id);
    }

    public async resume(userId: string, demandId: string): Promise<Demand> {
        const demand = await this.findOne(userId, demandId);
        if (!demand) {
            return null;
        }
        if (
            demand.status !== DemandStatus.PAUSED ||
            demand.bids.some((bid) => bid.status === OrderStatus.PendingCancellation)
        ) {
            const msg = `Demand ${demand.id} expected status is DemandStatus.PAUSED but had ${
                DemandStatus[demand.status]
            }`;
            this.logger.error(msg);
            throw new ForbiddenActionError(msg);
        }

        await this.repository.update(demand.id, { status: DemandStatus.ACTIVE });
        await this.reSubmitDemandBids(demand);

        return this.findOne(userId, demand.id);
    }

    public async findOne(userId: string, id: string): Promise<Demand> {
        return this.repository.findOne(id, { where: { userId } });
    }

    public async getAll(userId: string): Promise<Demand[]> {
        return this.repository.find({ where: { userId } });
    }

    private async cancelDemandBids(demand: Demand) {
        const bids = demand.bids.filter(
            (b) => b.status === OrderStatus.Active || b.status === OrderStatus.PartiallyFilled
        );
        for (const bid of bids) {
            await this.orderService.cancelOrder(demand.userId, bid.id, true);
        }
    }

    private async reSubmitDemandBids(demand: Demand) {
        const bids = demand.bids.filter(
            (b) =>
                b.status === OrderStatus.Cancelled || b.status === OrderStatus.PendingCancellation
        );
        for (const bid of bids) {
            await this.orderService.reactivateOrder(bid);
        }
    }

    private prepareBids(createDemand: CreateDemandDTO) {
        const validityDates = this.demandTimePeriodService.generateValidityDates(createDemand);
        return validityDates.map(
            ({ validFrom, generationFrom, generationTo }): CreateBidDTO => ({
                volume: createDemand.volumePerPeriod,
                price: createDemand.price,
                validFrom,
                product: createDemand.boundToGenerationTime
                    ? {
                          ...createDemand.product,
                          generationFrom: generationFrom.toISOString(),
                          generationTo: generationTo.toISOString()
                      }
                    : createDemand.product
            })
        );
    }
}
