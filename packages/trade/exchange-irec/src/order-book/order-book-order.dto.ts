import { OrderBookOrderDTO as BaseOrderBookOrderDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ProductDTO } from '../product/product.dto';

export class OrderBookOrderDTO extends BaseOrderBookOrderDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    product: ProductDTO;
}
