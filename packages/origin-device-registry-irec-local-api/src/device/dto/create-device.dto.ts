import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    facilityName: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    description: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    images: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    address: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    capacityInW: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    gpsLatitude: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    gpsLongitude: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    timezone: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    complianceRegistry: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    otherGreenAttributes: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    typeOfPublicSupport: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    deviceType: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    region: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    province: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    country: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    operationalSince: number;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    gridOperator: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    @Expose()
    files?: string;

    public static sanitize(device: CreateDeviceDTO): CreateDeviceDTO {
        return plainToClass(CreateDeviceDTO, device, { excludeExtraneousValues: true });
    }
}
