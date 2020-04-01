import { TimeFrame } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Connection, Repository } from 'typeorm';

import { MatchingEngineService } from '../matching-engine/matching-engine.service';
import { CreateBidDTO } from '../order/create-bid.dto';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { CreateDemandDTO } from './create-demand.dto';
import { Demand } from './demand.entity';

const moment = extendMoment(Moment);

@Injectable()
export class DemandService {
    private readonly logger = new Logger(DemandService.name);

    constructor(
        @InjectRepository(Demand, 'ExchangeConnection')
        private readonly repository: Repository<Demand>,
        private readonly orderService: OrderService,
        private readonly matchingService: MatchingEngineService,
        @InjectConnection('ExchangeConnection')
        private readonly connection: Connection
    ) {}

    public async create(userId: string, createDemand: CreateDemandDTO): Promise<Demand> {
        const validityDates = this.generateValidityDates(createDemand);
        const bidsToCreate = validityDates.map(
            (validFrom): CreateBidDTO => ({
                volume: createDemand.volumePerPeriod,
                price: createDemand.price,
                validFrom: validFrom.toDate(),
                product: createDemand.product
            })
        );

        let demand: Demand;
        let bids: Order[];

        await this.connection.transaction(async transaction => {
            const repository = transaction.getRepository<Demand>(Demand);

            demand = await repository.save({
                userId,
                price: createDemand.price,
                volumePerPeriod: new BN(createDemand.volumePerPeriod),
                periodTimeFrame: createDemand.periodTimeFrame,
                product: createDemand.product,
                start: createDemand.start,
                end: createDemand.end
            });

            bids = await this.orderService.createDemandBids(
                userId,
                bidsToCreate,
                demand.id,
                transaction
            );
        });

        bids.forEach(bid => this.matchingService.submit(bid));

        return this.findOne(userId, demand.id);
    }

    public async findOne(userId: string, id: string) {
        return this.repository.findOne(id, { where: { userId } });
    }

    public async getAll(userId: string) {
        return this.repository.find({ where: { userId } });
    }

    private generateValidityDates(createDemand: CreateDemandDTO) {
        const range = moment.range(createDemand.start, createDemand.end);

        const { diff, step } = this.timeFrameToTimeDiff(createDemand.periodTimeFrame);
        return Array.from(range.by(diff, { step, excludeEnd: true }));
    }

    private timeFrameToTimeDiff(
        timeFrame: TimeFrame
    ): { diff: Moment.unitOfTime.Diff; step?: number } {
        switch (timeFrame) {
            case TimeFrame.yearly:
                return { diff: 'year' };
            case TimeFrame.monthly:
                return { diff: 'month' };
            case TimeFrame.weekly:
                return { diff: 'week' };
            case TimeFrame.daily:
                return { diff: 'day' };
            case TimeFrame.hourly:
                return { diff: 'hour' };
            case TimeFrame.halfHourly:
                return { diff: 'minute', step: 30 };
            default:
                throw new Error('Unknown timeframe');
        }
    }
}
