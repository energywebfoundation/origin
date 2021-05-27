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

    @ApiProperty({ type: String })
    @Expose()
    postalCode: string;

    @ApiProperty({ type: String })
    @Expose()
    country: string;

    @ApiProperty({ type: String })
    @Expose()
    region: string;

    @ApiProperty({ type: String })
    @Expose()
    subregion: string;
}
