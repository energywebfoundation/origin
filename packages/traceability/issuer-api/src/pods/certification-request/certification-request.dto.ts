import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    Validate
} from 'class-validator';

export class CertificationRequestDTO {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    id: number;

    @ApiProperty({ type: String })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: String })
    @IsString()
    owner: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: [String] })
    @IsArray()
    files: string[];

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    created: number;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    approved: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    revoked: boolean;

    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    approvedDate?: Date;

    @ApiPropertyOptional({ type: Date })
    @IsOptional()
    @IsDate()
    revokedDate?: Date;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsInt()
    @Min(0)
    issuedCertificateId?: number;

    @ApiPropertyOptional({ type: Boolean })
    isPrivate?: boolean;
}
