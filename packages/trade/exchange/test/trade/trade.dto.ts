import { ApiProperty } from '@nestjs/swagger';

import { TradeDTO as BaseTradeDTO } from '../../src/pods/trade';

export class TradeDTO extends BaseTradeDTO<string> {
    @ApiProperty({ type: String })
    public product: string;
}
