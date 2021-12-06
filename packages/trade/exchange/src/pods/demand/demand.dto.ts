import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { IDemand } from './demand.entity';
import { Order } from '../order/order.entity';

export class DemandDTO<TProduct> implements IDemand {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({ type: Date, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @IsNotEmpty()
    @IsDate()
    start: Date;

    @ApiProperty({ type: Date, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @IsNotEmpty()
    @IsDate()
    end: Date;

    @ApiProperty({ type: String, example: '1000' })
    @IsNotEmpty()
    volumePerPeriod: BN;

    @ApiProperty({ enum: TimeFrame, enumName: 'TimeFrame' })
    @IsNotEmpty()
    @IsEnum(TimeFrame)
    periodTimeFrame: TimeFrame;

    product: TProduct;

    @ApiProperty({ type: [Order] })
    bids: Order[];

    @ApiProperty({ enum: DemandStatus, enumName: 'DemandStatus' })
    @IsNotEmpty()
    @IsEnum(DemandStatus)
    status: DemandStatus;
}
