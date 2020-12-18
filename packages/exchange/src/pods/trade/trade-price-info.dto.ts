import { ApiProperty } from '@nestjs/swagger';
import BN from 'bn.js';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TradePriceInfoDTO<TProduct> {
    constructor(partial: Partial<TradePriceInfoDTO<TProduct>>) {
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

    public product: TProduct;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public assetId: string;
}
