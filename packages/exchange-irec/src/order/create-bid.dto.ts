import { CreateBidDTO as BaseCreateBidDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { ProductDTO } from '../product/product.dto';

export class CreateBidDTO extends BaseCreateBidDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ProductDTO)
    readonly product: ProductDTO;
}
