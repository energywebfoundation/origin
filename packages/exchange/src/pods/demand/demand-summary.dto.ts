import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsArray } from 'class-validator';
import { CreateBidDTO } from '../order/create-bid.dto';

export class DemandSummaryDTO {
    constructor(bids: CreateBidDTO[]) {
        this.bids = bids;
    }

    @ApiProperty({ type: [CreateBidDTO] })
    @IsArray()
    @Expose()
    bids: CreateBidDTO[];

    @ApiProperty({ type: String })
    @Transform((v: BN) => v.toString(10))
    @Expose()
    get volume(): BN {
        return this.bids.reduce((sum: BN, item) => sum.add(new BN(item.volume)), new BN(0));
    }
}
