import { TradePriceInfoDTO as BaseTradePriceInfoDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

import { ProductDTO } from '../product';

export class TradePriceInfoDTO extends BaseTradePriceInfoDTO<ProductDTO> {
    @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    public product: ProductDTO;
}
