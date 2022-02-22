/* eslint-disable @typescript-eslint/no-shadow */
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID, Validate } from 'class-validator';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { Trade } from './trade.entity';
import { IAsset } from '../asset/asset.entity';

export class TradeDTO<TProduct> {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    public id: string;

    @ApiProperty({ type: String, example: 'Tue Nov 16 2021 16:09:43 GMT-0500' })
    @IsDateString()
    @IsNotEmpty()
    public created: string;

    @ApiProperty({ type: String, example: '500' })
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

export class TradeForAdminDTO<TProduct> extends TradeDTO<TProduct> {
    @ApiProperty({ type: String, example: '1' })
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    askUserId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    bidUserId: string;

    public static fromTradeForAdmin<TProduct>(
        trade: Trade,
        asset: IAsset,
        product: TProduct
    ): TradeForAdminDTO<TProduct> {
        return {
            id: trade.id,
            created: trade.created.toISOString(),
            price: trade.price,
            volume: trade.volume.toString(10),
            bidId: trade.bid?.id,
            askId: trade.ask?.id,
            assetId: asset.id,
            product,
            askUserId: trade.ask?.userId,
            bidUserId: trade.bid?.userId,
            tokenId: asset.tokenId
        };
    }
}
