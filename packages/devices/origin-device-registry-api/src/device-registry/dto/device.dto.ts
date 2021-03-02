import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NewDeviceDTO } from './new-device.dto';

export class DeviceDTO extends NewDeviceDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    owner: string;
}
