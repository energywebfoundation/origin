import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateDeviceStatusDTO {
    @ApiProperty({ enum: DeviceState, enumName: 'DeviceStatus' })
    @IsEnum(DeviceState)
    @IsNotEmpty()
    status: DeviceState;
}
