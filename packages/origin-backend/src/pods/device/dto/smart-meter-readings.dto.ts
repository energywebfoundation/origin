import { ISmartMeterRead } from '@energyweb/origin-backend-core';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Validate } from 'class-validator';

export class SmartMeterReadDTO implements ISmartMeterRead {
    @ApiProperty({ type: String })
    @Validate(IntUnitsOfEnergy)
    meterReading: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    timestamp: number;
}
