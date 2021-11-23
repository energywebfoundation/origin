import { PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Validate, ValidateNested } from 'class-validator';
import { CreateAssetDTO } from '../../asset/create-asset.dto';

export class CreateDepositDTO {
    @ApiProperty({ type: CreateAssetDTO })
    @ValidateNested()
    public readonly asset: CreateAssetDTO;

    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsNotEmpty()
    @IsString()
    public readonly address: string;

    @ApiProperty({
        type: String,
        example: '0x2b8da531e46cff1e217abc113495befac9384339feb10816b0f7f2ffa02fadd4'
    })
    @IsNotEmpty()
    @IsString()
    public readonly transactionHash: string;

    @ApiProperty({ type: String, example: '500' })
    @Validate(PositiveBNStringValidator)
    public readonly amount: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    public readonly blockNumber: number;
}
