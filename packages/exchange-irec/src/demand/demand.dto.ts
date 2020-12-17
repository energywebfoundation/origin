import { DemandDTO as BaseDemandDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDTO } from '../product/product.dto';

export class DemandDTO extends BaseDemandDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    product: ProductDTO;
}
