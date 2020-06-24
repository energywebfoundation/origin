import { Expose, Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsPositive,
    IsDate,
    IsLatitude,
    IsLongitude
} from 'class-validator';

export class Device {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose({ name: 'default_account_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    defaultAccount: string;

    @Expose({ name: 'device_type_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    deviceType: string;

    @Expose({ name: 'fuel_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    fuel: string;

    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    countryCode: string;

    @Expose({ name: 'device_type_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    registrantOrganization: string;

    @IsPositive()
    capacity: number;

    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    commissioningDate: Date;

    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    registrationDate: Date;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsLatitude()
    latitude: number;

    @IsLongitude()
    longitude: number;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsBoolean()
    supported: boolean;

    @IsOptional()
    @IsString()
    notes?: string;
}
