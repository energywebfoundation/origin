import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IrecDeviceDTO } from './irec-device.dto';

export class DeviceDTO extends IrecDeviceDTO {
    @ApiProperty({ type: String })
    @Expose()
    id: string;

    @ApiProperty({ type: String })
    @Expose()
    ownerId: string;

    @ApiProperty({ type: String })
    @Expose()
    timezone: string;

    @ApiProperty({ type: String })
    @Expose()
    gridOperator: string;
}
