import { DeviceStatus, IDevice, IPublicOrganization } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested
} from 'class-validator';
import { PublicOrganizationInfoDTO } from '../organization';
import { ExternalDeviceIdDTO } from './external-device-id.dto';
import { SmartMeterReadDTO } from './smart-meter-readings.dto';
import { SmartMeterStatsDTO } from './smart-meter-stats.dto';

export class DeviceDTO implements IDevice {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ enum: DeviceStatus, enumName: 'DeviceStatus' })
    @IsEnum(DeviceStatus)
    @IsNotEmpty()
    status: DeviceStatus;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    facilityName: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ type: String })
    @IsString()
    images: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    capacityInW: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    gpsLatitude: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    gpsLongitude: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    timezone: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    complianceRegistry: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    otherGreenAttributes: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    typeOfPublicSupport: string;

    @ApiProperty({ type: [ExternalDeviceIdDTO], required: false })
    @IsOptional()
    @IsArray()
    externalDeviceIds?: ExternalDeviceIdDTO[];

    @ApiProperty({ type: SmartMeterStatsDTO, required: false })
    @IsOptional()
    meterStats?: SmartMeterStatsDTO;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    deviceGroup?: string;

    @ApiProperty({ type: [SmartMeterReadDTO], required: false })
    @IsArray()
    @IsOptional()
    smartMeterReads?: SmartMeterReadDTO[];

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    defaultAskPrice: number;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    automaticPostForSale: boolean;

    @ApiProperty({ type: PublicOrganizationInfoDTO })
    @ValidateNested()
    organization: IPublicOrganization;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    deviceType: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    province: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    operationalSince: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    gridOperator: string;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: DeviceDTO) => !!dto.files)
    @IsString()
    files?: string;
}
