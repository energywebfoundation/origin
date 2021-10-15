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
    @ApiProperty({ type: String })
    @IsEthereumAddress()
    to: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: String })
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
