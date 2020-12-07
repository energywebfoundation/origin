/* eslint-disable max-classes-per-file */
import { Expose, Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsPositive,
    IsDate,
    IsLatitude,
    IsLongitude,
    ValidateNested,
    IsIn
} from 'class-validator';

export class CodeName {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export enum DeviceState {
    Draft = 'Draft',
    Rejected = 'Rejected',
    Referred = 'Referred',
    Submitted = 'Submitted',
    Verified = 'Verified',
    Approved = 'Approved'
}

export class Device {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @ValidateNested()
    account: CodeName;

    @IsPositive()
    @Transform((value: string) => Number(value), { toClassOnly: true })
    capacity: number;

    @IsNotEmpty()
    @ValidateNested()
    registrant: CodeName;

    @IsNotEmpty()
    @ValidateNested()
    issuer: CodeName;

    @Expose({ name: 'device_type', toPlainOnly: true })
    @IsNotEmpty()
    @ValidateNested()
    deviceType: CodeName;

    @IsNotEmpty()
    @ValidateNested()
    fuel: CodeName;

    @Expose({ name: 'country_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    countryCode: string;

    @Expose({ name: 'commissioning_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    commissioningDate: Date;

    @Expose({ name: 'registration_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    registrationDate: Date;

    @Expose({ name: 'expiry_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    expiryDate: Date;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsLatitude()
    @Transform((value: string) => Number(value), { toClassOnly: true })
    latitude: number;

    @IsLongitude()
    @Transform((value: string) => Number(value), { toClassOnly: true })
    longitude: number;

    @IsOptional()
    @IsBoolean()
    supported: boolean;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(DeviceState))
    status:
        | DeviceState.Approved
        | DeviceState.Draft
        | DeviceState.Referred
        | DeviceState.Rejected
        | DeviceState.Submitted
        | DeviceState.Verified;
}

export class DeviceCreateUpdateParams {
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

    @Expose({ name: 'registrant_organisation_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    registrantOrganization: string;

    @Expose({ name: 'issuer_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    issuer: string;

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
    @IsString()
    notes?: string;
}
