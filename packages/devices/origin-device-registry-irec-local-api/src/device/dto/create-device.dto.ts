import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Type } from 'class-transformer';
import {
    IsDate,
    IsISO31661Alpha2,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';

export class CreateDeviceDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    deviceType: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    fuelType: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsISO31661Alpha2()
    @Expose()
    countryCode: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Expose()
    capacity: string;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    @Expose()
    @Type(() => Date)
    commissioningDate: Date;

    @ApiProperty({ type: Date })
    @IsNotEmpty()
    @IsDate()
    @Expose()
    @Type(() => Date)
    registrationDate: Date;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @Expose()
    address: string;

    @ApiProperty({ type: String })
    @IsLatitude()
    @Expose()
    latitude: string;

    @ApiProperty({ type: String })
    @IsLongitude()
    @Expose()
    longitude: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @Expose()
    notes?: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    timezone: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @Expose()
    gridOperator: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    postalCode: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    region: string;

    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    @Expose()
    subregion: string;

    @ApiProperty({ type: String, required: false })
    @IsString()
    @IsOptional()
    @Expose()
    irecTradeAccountCode?: string;

    @ApiProperty({ type: [String], required: false, example: ['test.pdf', 'test2.pdf'] })
    @IsString({ each: true })
    @IsOptional()
    files?: string[];

    public static sanitize(device: CreateDeviceDTO): CreateDeviceDTO {
        return plainToClass(CreateDeviceDTO, device, { excludeExtraneousValues: true });
    }
}
