import {
    TradeDTO as BaseTradeDTO,
    TradeForAdminDTO as BaseTradeForAdminDTO
} from '@energyweb/exchange';
import { ApiProperty } from '@nestjs/swagger';

import { ProductDTO } from '../product/product.dto';

export class TradeDTO extends BaseTradeDTO<ProductDTO> {
    @ApiProperty({ type: () => ProductDTO })
    public product: ProductDTO;
}

export class TradeForAdminDTO extends BaseTradeForAdminDTO<ProductDTO> {
    @ApiProperty({ type: () => ProductDTO })
    public product: ProductDTO;
}
