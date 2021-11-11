import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { ClaimDTO } from './claim.dto';
import { EnergyDTO } from './energy.dto';

export class CertificateDTO {
    @ApiProperty({ type: Number, description: 'Certificate Id' })
    @IsInt()
    @Min(1)
    id: number;

    @ApiProperty({ type: String, example: 'DeviceB-789' })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    generationStartTime: number;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    generationEndTime: number;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    creationTime: number;

    @ApiProperty({ type: String, example: 'Additional Details' })
    @IsString()
    metadata: string;

    @ApiProperty({ type: EnergyDTO })
    @ValidateNested()
    energy: EnergyDTO;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isOwned: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isClaimed: boolean;

    @ApiPropertyOptional({ type: [ClaimDTO] })
    @IsOptional()
    @IsArray()
    myClaims?: ClaimDTO[];

    @ApiPropertyOptional({ type: [ClaimDTO] })
    @IsOptional()
    @IsArray()
    claims?: ClaimDTO[];

    @ApiPropertyOptional()
    @IsOptional()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blockchain?: any;

    @ApiProperty({
        type: String,
        example: '0x2b8da531e46cff1e217abc113495befac9384339feb10816b0f7f2ffa02fadd4'
    })
    creationTransactionHash?: string;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @IsBoolean()
    issuedPrivately?: boolean;
}
