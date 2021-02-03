import { DemandSummaryDTO as BaseDemandSummaryDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';

import { CreateBidDTO } from '../order/create-bid.dto';
import { ProductDTO } from '../product/product.dto';

export class DemandSummaryDTO extends BaseDemandSummaryDTO<ProductDTO> {
    @ApiProperty({ type: [CreateBidDTO] })
    @IsArray()
    @Expose()
    bids: CreateBidDTO[];
}
