import { DeviceCreateData, DeviceStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ExternalDeviceIdDTO } from './external-device-id.dto';
import { SmartMeterReadDTO } from './smart-meter-readings.dto';

export class CreateDeviceDTO implements DeviceCreateData {
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
    description: string;

    @ApiProperty({ type: String })
    @IsString()
    images: string;

    @ApiProperty({ type: String })
    @IsString()
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
    timezone: string;

    @ApiProperty({ type: String })
    @IsString()
    complianceRegistry: string;

    @ApiProperty({ type: String })
    @IsString()
    otherGreenAttributes: string;

    @ApiProperty({ type: String })
    @IsString()
    typeOfPublicSupport: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    deviceType: string;

    @ApiProperty({ type: String })
    @IsString()
    region: string;

    @ApiProperty({ type: String })
    @IsString()
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
    gridOperator: string;

    @ApiProperty({ type: [SmartMeterReadDTO], required: false })
    @IsArray()
    @IsOptional()
    smartMeterReads?: SmartMeterReadDTO[];

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    files?: string;

    @ApiProperty({ type: [ExternalDeviceIdDTO], required: false })
    @IsOptional()
    @IsArray()
    externalDeviceIds?: ExternalDeviceIdDTO[];

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    deviceGroup?: string;
}
