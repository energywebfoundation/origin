import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { CreateBidDTO as CreateBid } from '../../src/pods/order';

export class CreateBidDTO extends CreateBid<string> {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    readonly product: string;
}
