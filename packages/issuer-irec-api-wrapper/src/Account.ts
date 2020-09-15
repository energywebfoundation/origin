/* eslint-disable max-classes-per-file */
import { Type, Expose, Transform } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import moment from 'moment-timezone';
import { Product } from './Product';

export enum AccountType {
    Issue = 'Issue',
    Redemption = 'Redemption',
    Trade = 'Trade'
}

export enum TransactionType {
    Issue = 'Issue',
    Redemption = 'Redemption',
    Transfer = 'Transfer'
}

export class Beneficiary {
    id: number;

    name: string;
}

export class AccountDetails {
    name: string;

    private: boolean;

    restricted: boolean;

    active: boolean;

    notes: string;

    @Expose({ name: 'country_code' })
    countryCode?: string;
}

export class Account {
    @IsString()
    @IsNotEmpty()
    code: string;

    @Type(() => AccountDetails)
    @Expose({ name: 'account_details' })
    @Transform((value) => value[0], { toClassOnly: true })
    @ValidateNested()
    details: AccountDetails;

    @Expose({ name: 'account_type' })
    @Transform((value) => value.code, { toClassOnly: true })
    @IsEnum(AccountType)
    type: AccountType;
}

export class AccountBalance {
    @Transform((value) => parseFloat(value), { toClassOnly: true })
    balance: number;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'account', toClassOnly: true })
    code: string;

    @Type(() => Product)
    product: Product;
}

export class AccountTransaction {
    code: string;

    @Transform((value) => parseFloat(value), { toClassOnly: true })
    volume: number;

    notes: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'source_account', toClassOnly: true })
    sender: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'destination_account', toClassOnly: true })
    recipient: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'transaction_type', toClassOnly: true })
    transactionType: TransactionType;

    purpose: string;

    @Type(() => Beneficiary)
    beneficiary: Beneficiary;

    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    time: Date;

    @Expose({ name: 'period_start', toPlainOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    start: Date;

    @Expose({ name: 'period_end', toPlainOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    end: Date;
}
