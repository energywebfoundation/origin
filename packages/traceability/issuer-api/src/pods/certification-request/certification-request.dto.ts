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
    @ApiProperty({ type: Number, description: 'Certificate Id' })
    @IsInt()
    @Min(0)
    id: number;

    @ApiProperty({ type: String, example: 'DeviceB-789' })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: String, example: '10000' })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsString()
    owner: string;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154481 })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({
        type: [String],
        description: 'Array of file names',
        example: ['test.pdf', 'test2.pdf']
    })
    @IsArray()
    files: string[];

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154481 })
    @IsInt()
    @IsPositive()
    created: number;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    approved: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    revoked: boolean;

    @ApiPropertyOptional({ type: Date, example: 'Sat Nov 06 2021 12:18:12 GMT-0400' })
    @IsOptional()
    @IsDate()
    approvedDate?: Date;

    @ApiPropertyOptional({ type: Date, example: 'Sat Nov 06 2021 12:18:12 GMT-0400' })
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
