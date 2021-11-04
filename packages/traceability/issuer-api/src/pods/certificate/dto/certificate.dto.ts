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
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(1)
    id: number;

    @ApiProperty({ type: String })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    generationStartTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    generationEndTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    creationTime: number;

    @ApiProperty({ type: String })
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

    @ApiProperty({ type: String })
    creationTransactionHash?: string;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @IsBoolean()
    issuedPrivately?: boolean;
}
