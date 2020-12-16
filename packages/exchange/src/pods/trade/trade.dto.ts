import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsUUID,
    Validate,
    ValidateNested
} from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { Trade } from './trade.entity';

export class TradeDTO<TProduct> {
    @ApiProperty({ type: String })
    @IsUUID()
    @IsNotEmpty()
    public id: string;

    @ApiProperty({ type: String })
    @IsDateString()
    @IsNotEmpty()
    public created: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    public volume: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @ApiProperty({ type: String })
    @IsUUID()
    @IsNotEmpty()
    public bidId: string;

    @ApiProperty({ type: String })
    @IsUUID()
    @IsNotEmpty()
    public askId: string;

    // @ApiProperty({ type: ProductDTO })
    @ValidateNested()
    @IsNotEmpty()
    public product: TProduct;

    @ApiProperty({ type: String })
    @IsUUID()
    @IsNotEmpty()
    public assetId: string;

    public static fromTrade<TProduct>(
        trade: Trade,
        assetId: string,
        product: TProduct
    ): TradeDTO<TProduct> {
        return {
            id: trade.id,
            created: trade.created.toISOString(),
            price: trade.price,
            volume: trade.volume.toString(10),
            bidId: trade.bid?.id,
            askId: trade.ask?.id,
            assetId,
            product
        };
    }
}
