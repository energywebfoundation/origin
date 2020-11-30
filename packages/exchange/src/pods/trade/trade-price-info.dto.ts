import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

import { ProductDTO } from '../order/product.dto';

export class TradePriceInfoDTO {
    constructor(partial: Partial<TradePriceInfoDTO>) {
        Object.assign(this, partial);
    }

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    public created: Date;

    @Transform((value: BN) => value.toString(10))
    public volume: BN;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    public product: ProductDTO;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public assetId: string;
}
