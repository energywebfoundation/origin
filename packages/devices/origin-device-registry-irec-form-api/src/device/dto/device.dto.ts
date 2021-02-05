import { IDevice } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { CreateDeviceDTO } from './create-device.dto';
import { SmartMeterStatsDTO } from './smart-meter-stats.dto';

export class DeviceDTO extends CreateDeviceDTO implements IDevice {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: SmartMeterStatsDTO, required: false })
    @IsOptional()
    meterStats?: SmartMeterStatsDTO;

    @ApiProperty({ type: Number })
    organizationId: number;
}
