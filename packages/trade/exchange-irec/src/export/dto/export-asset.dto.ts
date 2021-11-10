import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ExportAssetDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    readonly assetId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    readonly recipientTradeAccount: string;

    @ApiProperty({ type: String })
    @IsNumberString()
    readonly amount: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    readonly fromTradeAccount?: string;
}
