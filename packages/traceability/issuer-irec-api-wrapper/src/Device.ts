import { Expose, Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsIn,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';
import { FileIds } from './File';
import { timeToTimezoneDate } from './helpers';

export enum DeviceState {
    Draft = 'Draft',
    InProgress = 'In-progress',
    Rejected = 'Rejected',
    Approved = 'Approved',
    Submitted = 'Submitted'
}

export class DeviceCreateParams extends FileIds {
    @IsString()
    name: string;

    @Expose({ name: 'default_account_code', toPlainOnly: true })
    @IsString()
    defaultAccount: string;

    @Expose({ name: 'device_type_code', toPlainOnly: true })
    @IsString()
    deviceType: string;

    @Expose({ name: 'fuel_code', toPlainOnly: true })
    @IsString()
    fuelType: string;

    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    countryCode: string;

    @Expose({ name: 'registrant_organisation_code', toPlainOnly: true })
    @IsString()
    registrantOrganization: string;

    @Expose({ name: 'issuer_code', toPlainOnly: true })
    @IsString()
    issuer: string;

    @Expose()
    capacity: string;

    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => timeToTimezoneDate(value), {
        toPlainOnly: true
    })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    commissioningDate: Date;

    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => timeToTimezoneDate(value), { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    registrationDate: Date;

    @IsString()
    address: string;

    @IsLatitude()
    latitude: string;

    @IsLongitude()
    longitude: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;
}

export class DeviceUpdateParams extends FileIds {
    @Expose()
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Expose({ name: 'default_account_code', toPlainOnly: true })
    @IsString()
    defaultAccount?: string;

    @IsOptional()
    @Expose({ name: 'device_type_code', toPlainOnly: true })
    @IsString()
    deviceType?: string;

    @IsOptional()
    @Expose({ name: 'fuel_code', toPlainOnly: true })
    @IsString()
    fuelType?: string;

    @IsOptional()
    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    countryCode?: string;

    @IsOptional()
    @Expose({ name: 'registrant_organisation_code', toPlainOnly: true })
    @IsString()
    registrantOrganization?: string;

    @IsOptional()
    @Expose({ name: 'issuer_code', toPlainOnly: true })
    @IsString()
    issuer?: string;

    @IsOptional()
    @Expose()
    capacity?: string;

    @IsOptional()
    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => timeToTimezoneDate(value), {
        toPlainOnly: true
    })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    commissioningDate?: Date;

    @IsOptional()
    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => timeToTimezoneDate(value), { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    registrationDate?: Date;

    @Expose()
    @IsOptional()
    @IsString()
    address?: string;

    @Expose()
    @IsOptional()
    @IsLatitude()
    latitude?: string;

    @Expose()
    @IsOptional()
    @IsLongitude()
    longitude?: string;

    @Expose()
    @IsOptional()
    @IsString()
    notes?: string;

    @Expose()
    @IsOptional()
    @IsBoolean()
    active: boolean;
}

export class Device extends DeviceCreateParams {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(DeviceState))
    status:
        | DeviceState.Approved
        | DeviceState.Draft
        | DeviceState.InProgress
        | DeviceState.Rejected
        | DeviceState.Submitted;
}
