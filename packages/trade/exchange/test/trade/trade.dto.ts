import { ApiProperty } from '@nestjs/swagger';

import {
    TradeDTO as BaseTradeDTO,
    TradeForAdminDTO as BaseTradeForAdminDTO
} from '../../src/pods/trade';

export class TradeDTO extends BaseTradeDTO<string> {
    @ApiProperty({ type: String })
    public product: string;
}

export class TradeForAdminDTO extends BaseTradeForAdminDTO<string> {
    @ApiProperty({ type: String })
    public product: string;
}
