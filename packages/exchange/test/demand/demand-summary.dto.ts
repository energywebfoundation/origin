import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';

import { DemandSummaryDTO as BaseDemandSummaryDTO } from '../../src/pods/demand/demand-summary.dto';
import { CreateBidDTO } from '../order/create-bid.dto';

export class DemandSummaryDTO extends BaseDemandSummaryDTO<string> {
    @ApiProperty({ type: [CreateBidDTO] })
    @IsArray()
    @Expose()
    bids: CreateBidDTO[];
}
