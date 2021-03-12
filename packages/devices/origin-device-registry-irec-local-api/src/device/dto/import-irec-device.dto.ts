import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ImportIrecDeviceDTO {
    @ApiProperty({ type: String })
    @Expose()
    code: string;

    @ApiProperty({ type: String })
    @Expose()
    timezone: string;

    @ApiProperty({ type: String })
    @Expose()
    gridOperator: string;
}
