import { DeviceStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateDeviceStatusDTO {
    @ApiProperty({ enum: DeviceStatus, enumName: 'DeviceStatus' })
    @IsEnum(DeviceStatus)
    @IsNotEmpty()
    status: DeviceStatus;
}
