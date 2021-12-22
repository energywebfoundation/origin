import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEthereumAddress,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    Validate
} from 'class-validator';

export class IssueCertificateDTO {
    @ApiProperty({ type: String, example: "'0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E9" })
    @IsEthereumAddress()
    to: string;

    @ApiProperty({ type: String, example: '900' })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: Number, example: 1636154471, description: 'Unix Timestamp' })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number, example: 1636154476, description: 'Unix Timestamp' })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: String, example: 'B-145' })
    @IsString()
    deviceId: string;

    @ApiPropertyOptional({ type: Boolean })
    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsString()
    metadata?: string;
}
