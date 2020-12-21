import { TradeDTO as BaseTradeDTO } from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDTO } from '../product/product.dto';

export class TradeDTO extends BaseTradeDTO<ProductDTO> {
    @ApiProperty({ type: () => ProductDTO })
    public product: ProductDTO;
}
