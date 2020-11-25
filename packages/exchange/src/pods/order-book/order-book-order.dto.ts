import { Bid, Ask } from '@energyweb/exchange-core';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested
} from 'class-validator';
import { ProductDTO } from '../order/product.dto';

export class OrderBookOrderDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    price: number;

    @ApiProperty({ type: String })
    @IsString()
    volume: string;

    @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    product: ProductDTO;

    @ApiProperty({ type: String })
    @IsString()
    userId: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    assetId?: string;

    public static fromOrder(order: Bid | Ask, userId?: string): OrderBookOrderDTO {
        return {
            ...order,
            volume: order.volume.toString(10),
            userId: order.userId === userId ? order.userId : undefined
        };
    }
}
