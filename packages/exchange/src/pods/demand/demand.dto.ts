import { DemandStatus, TimeFrame } from '@energyweb/utils-general';
import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested
} from 'class-validator';
import { ProductDTO } from '../order/product.dto';
import { IDemand } from './demand.entity';
import { Order } from '../order/order.entity';

export class DemandDTO implements IDemand {
    @ApiProperty({ type: String })
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

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    start: Date;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    end: Date;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    volumePerPeriod: BN;

    @ApiProperty({ enum: TimeFrame, enumName: 'TimeFrame' })
    @IsNotEmpty()
    @IsEnum(TimeFrame)
    periodTimeFrame: TimeFrame;

    @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    product: ProductDTO;

    @ApiProperty({ type: [Order] })
    bids: Order[];

    @ApiProperty({ enum: DemandStatus, enumName: 'DemandStatus' })
    @IsNotEmpty()
    @IsEnum(DemandStatus)
    status: DemandStatus;
}
