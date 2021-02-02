import { Expose, Transform } from 'class-transformer';
import {
    IsDate,
    IsIn,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString
} from 'class-validator';

export enum DeviceState {
    Draft = 'Draft',
    InProgress = 'In-progress',
    Rejected = 'Rejected',
    Approved = 'Approved'
}

export class DeviceCreateUpdateParams {
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

    @Expose({ name: 'registrant_organisation_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    registrantOrganization: string;

    @Expose({ name: 'issuer_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    issuer: string;

    @Transform((value: string) => Number(value))
    @IsPositive()
    capacity: number;

    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    commissioningDate: Date;

    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
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
    @IsString()
    notes?: string;
}

export class Device extends DeviceCreateUpdateParams {
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
        | DeviceState.Rejected;
}
