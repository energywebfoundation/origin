import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsPositive,
    IsString,
    Validate,
    ValidateIf
} from 'class-validator';

export class CreateCertificationRequestDTO {
    @ApiProperty({ type: String })
    @IsString()
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

    @ApiProperty({ type: [String], required: false })
    @ValidateIf((dto: CreateCertificationRequestDTO) => !!dto.files)
    @IsArray()
    files?: string[];

    @ApiProperty({ type: Boolean, required: false })
    @ValidateIf((dto: CreateCertificationRequestDTO) => !!dto.isPrivate)
    @IsBoolean()
    isPrivate?: boolean;
}
