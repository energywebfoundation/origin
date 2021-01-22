import { DeviceStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceDTO {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    ownerId: string;

    @ApiProperty({ type: String })
    code: string;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    defaultAccount: string;

    @ApiProperty({ type: String })
    deviceType: string;

    @ApiProperty({ type: String })
    fuel: string;

    @ApiProperty({ type: String })
    countryCode: string;

    @ApiProperty({ type: String })
    registrantOrganization: string;

    @ApiProperty({ type: String })
    issuer: string;

    @ApiProperty({ type: Number })
    capacity: number;

    @ApiProperty({ type: Date })
    commissioningDate: Date;

    @ApiProperty({ type: Date })
    registrationDate: Date;

    @ApiProperty({ type: String })
    address: string;

    @ApiProperty({ type: String })
    latitude: string;

    @ApiProperty({ type: String })
    longitude: string;

    @ApiProperty({ type: String })
    notes: string;

    @ApiProperty({ enum: DeviceStatus, enumName: 'DeviceStatus' })
    status: DeviceStatus;

    @ApiProperty({ type: String })
    timezone: string;

    @ApiProperty({ type: String })
    gridOperator: string;
}
