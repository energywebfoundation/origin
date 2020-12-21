import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';

import { OrderBookOrderDTO } from './order-book-order.dto';
import { TradePriceInfoDTO } from './trade-price-info.dto';

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
