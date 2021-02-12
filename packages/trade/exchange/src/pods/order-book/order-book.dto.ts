import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { TradePriceInfoDTO } from '../trade/trade-price-info.dto';
import { OrderBookOrderDTO } from './order-book-order.dto';

export class OrderBookDTO<TProduct> {
    @ApiProperty({ type: [OrderBookOrderDTO] })
    @IsArray()
    @ValidateNested()
    asks: OrderBookOrderDTO<TProduct>[];

    @ApiProperty({ type: [OrderBookOrderDTO] })
    @IsArray()
    @ValidateNested()
    bids: OrderBookOrderDTO<TProduct>[];

    @ApiProperty({ type: TradePriceInfoDTO })
    @ValidateNested()
    lastTradedPrice: TradePriceInfoDTO<TProduct>;
}
