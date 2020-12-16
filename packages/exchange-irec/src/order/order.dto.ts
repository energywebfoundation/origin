import { OrderDTO as BaseOrderDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { ProductDTO } from '../product/product.dto';

export class OrderDTO extends BaseOrderDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    @IsNotEmpty()
    @ValidateNested()
    product: ProductDTO;
}
