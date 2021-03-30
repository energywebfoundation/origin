import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDate,
    IsISO31661Alpha2,
    IsLatitude,
    IsLongitude,
    IsNumber,
    IsOptional,
    IsString
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class UpdateDeviceDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    @Expose()
    name: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    @Expose()
    deviceType: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    @Expose()
    fuel: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsString()
    @IsISO31661Alpha2()
    @Expose()
    countryCode: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    @IsOptional()
    @Expose()
    capacity: number;

    @ApiProperty({ type: Date })
    @IsOptional()
    @IsDate()
    @Expose()
    @Type(() => Date)
    commissioningDate: Date;

    @ApiProperty({ type: Date })
    @IsOptional()
    @IsDate()
    @Expose()
    @Type(() => Date)
    registrationDate: Date;

    @ApiProperty({ type: String })
    @IsOptional()
    @Expose()
    address: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsLatitude()
    @Expose()
    latitude: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @IsLongitude()
    @Expose()
    longitude: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @Expose()
    notes?: string;

    @ApiProperty({ type: Boolean })
    @IsOptional()
    @IsBoolean()
    @Expose()
    active: boolean;
}
