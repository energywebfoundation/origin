import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { TradePriceInfoDTO } from '../trade/trade-price-info.dto';
import { OrderBookOrderDTO } from './order-book-order.dto';

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
