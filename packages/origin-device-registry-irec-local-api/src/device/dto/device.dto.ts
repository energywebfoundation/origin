import { ApiProperty } from '@nestjs/swagger';

export class DeviceDTO {
    @ApiProperty({ type: String })
    id: string;

    @ApiProperty({ type: String })
    ownerId: string;

    @ApiProperty({ type: String })
    facilityName: string;

    @ApiProperty({ type: String })
    description: string;

    @ApiProperty({ type: String })
    images: string;

    @ApiProperty({ type: String })
    address: string;

    @ApiProperty({ type: Number })
    capacityInW: number;

    @ApiProperty({ type: String })
    gpsLatitude: string;

    @ApiProperty({ type: String })
    gpsLongitude: string;

    @ApiProperty({ type: String })
    timezone: string;

    @ApiProperty({ type: String })
    complianceRegistry: string;

    @ApiProperty({ type: String })
    otherGreenAttributes: string;

    @ApiProperty({ type: String })
    typeOfPublicSupport: string;

    @ApiProperty({ type: String })
    deviceType: string;

    @ApiProperty({ type: String })
    region: string;

    @ApiProperty({ type: String })
    province: string;

    @ApiProperty({ type: String })
    country: string;

    @ApiProperty({ type: Number })
    operationalSince: number;

    @ApiProperty({ type: String })
    gridOperator: string;
}
