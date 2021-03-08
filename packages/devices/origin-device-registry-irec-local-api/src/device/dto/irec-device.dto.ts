import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export { DeviceState } from '@energyweb/issuer-irec-api-wrapper';

export class IrecDeviceDTO {
    @ApiProperty({ type: String })
    @Expose()
    id: string;

    @ApiProperty({ type: String })
    @Expose()
    ownerId: string;

    @ApiProperty({ type: String })
    @Expose()
    code: string;

    @ApiProperty({ type: String })
    @Expose()
    name: string;

    @ApiProperty({ type: String })
    @Expose()
    defaultAccount: string;

    @ApiProperty({ type: String })
    @Expose()
    deviceType: string;

    @ApiProperty({ type: String })
    @Expose()
    fuel: string;

    @ApiProperty({ type: String })
    @Expose()
    countryCode: string;

    @ApiProperty({ type: String })
    @Expose()
    registrantOrganization: string;

    @ApiProperty({ type: String })
    @Expose()
    issuer: string;

    @ApiProperty({ type: Number })
    @Expose()
    capacity: number;

    @ApiProperty({ type: Date })
    @Expose()
    commissioningDate: Date;

    @ApiProperty({ type: Date })
    @Expose()
    registrationDate: Date;

    @ApiProperty({ type: String })
    @Expose()
    address: string;

    @ApiProperty({ type: String })
    @Expose()
    latitude: string;

    @ApiProperty({ type: String })
    @Expose()
    longitude: string;

    @ApiProperty({ type: String })
    @Expose()
    notes: string;

    @ApiProperty({ enum: DeviceState, enumName: 'DeviceState' })
    @Expose()
    status: DeviceState;
}
