import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Validate, ValidateNested } from 'class-validator';
import { CreateAssetDTO } from '../../asset/create-asset.dto';

export class CreateDepositDTO {
    @ApiProperty({ type: CreateAssetDTO })
    @ValidateNested()
    public readonly asset: CreateAssetDTO;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public readonly address: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public readonly transactionHash: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    public readonly amount: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    public readonly blockNumber: number;
}
