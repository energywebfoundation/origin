import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';

export class UpdateDeviceStateDTO {
    @ApiProperty({ enum: [DeviceState.Rejected, DeviceState.Approved], enumName: 'DeviceState' })
    @IsEnum([DeviceState.Rejected, DeviceState.Approved])
    @IsNotEmpty()
    status: DeviceState.Rejected | DeviceState.Approved;
}
