import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';

import { OrderBookOrderDTO, TradePriceInfoDTO } from '.';

export class OrderBookDTO {
    @ApiProperty({ type: [OrderBookOrderDTO] })
    @IsArray()
    @ValidateNested()
    asks: OrderBookOrderDTO[];

    @ApiProperty({ type: [OrderBookOrderDTO] })
    @IsArray()
    @ValidateNested()
    bids: OrderBookOrderDTO[];

    @ApiProperty({ type: TradePriceInfoDTO })
    @ValidateNested()
    lastTradedPrice: TradePriceInfoDTO;
}
