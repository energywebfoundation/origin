import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { OrderDTO as BaseOrderDTO } from '../../src/pods/order';

export class OrderDTO extends BaseOrderDTO<string> {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    product: string;
}
