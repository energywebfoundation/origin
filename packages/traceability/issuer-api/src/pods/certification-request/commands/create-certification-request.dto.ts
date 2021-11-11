import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    Validate,
    ValidateIf
} from 'class-validator';

export class CreateCertificationRequestDTO {
    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsString()
    @IsNotEmpty()
    to: string;

    @ApiProperty({ type: String, example: '1000000' })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number, description: 'Unix timestamp', example: 1636154471 })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: String, example: 'DeviceB-789' })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: [String], required: false, example: ['test.pdf', 'test2.pdf'] })
    @ValidateIf((dto: CreateCertificationRequestDTO) => !!dto.files)
    @IsArray()
    files?: string[];

    @ApiProperty({ type: Boolean, required: false })
    @ValidateIf((dto: CreateCertificationRequestDTO) => !!dto.isPrivate)
    @IsBoolean()
    isPrivate?: boolean;
}
