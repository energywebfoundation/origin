import { OrderSide, OrderStatus } from '@energyweb/exchange-core';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    Validate,
    ValidateNested
} from 'class-validator';
import { OrderType } from './order-type.enum';
import { ProductDTO } from './product.dto';

export class OrderDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(IntUnitsOfEnergy)
    startVolume: BN;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Validate(IntUnitsOfEnergy)
    currentVolume: BN;

    @ApiProperty({ enum: OrderSide, enumName: 'OrderSide' })
    @IsNotEmpty()
    @IsEnum(OrderSide)
    side: OrderSide;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({ enum: OrderType, enumName: 'OrderType' })
    @IsNotEmpty()
    @IsEnum(OrderType)
    type: OrderType;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    directBuyId: string;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    validFrom: Date;

    @ApiProperty({ type: ProductDTO })
    @IsNotEmpty()
    @ValidateNested()
    product: ProductDTO;
}
