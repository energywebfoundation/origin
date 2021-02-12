import { OrderSide, OrderStatus } from '@energyweb/exchange-core';
import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';

import { OrderType } from './order-type.enum';

export class OrderDTO<TProduct> {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    userId: string;

    @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
    status: OrderStatus;

    @ApiProperty({ type: String })
    startVolume: BN;

    @ApiProperty({ type: String })
    currentVolume: BN;

    @ApiProperty({ enum: OrderSide, enumName: 'OrderSide' })
    side: OrderSide;

    @ApiProperty({ type: Number })
    price: number;

    @ApiProperty({ enum: OrderType, enumName: 'OrderType' })
    type: OrderType;

    @ApiProperty({ type: String })
    directBuyId: string;

    @ApiProperty({ type: Date })
    validFrom: Date;

    @ApiProperty({ type: String })
    assetId: string;

    product: TProduct;
}
