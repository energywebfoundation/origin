/* eslint-disable max-classes-per-file */
import { Type, Expose, Transform } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import { Product } from './Product';

export enum AccountType {
    Issuer = 'Issuer',
    Redemption = 'Redemption',
    Trade = 'Trade'
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
    @IsEnum(AccountType)
    type: AccountType;
}

export class AccountBalance {
    balance: number;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'account', toClassOnly: true })
    code: string;

    @Type(() => Product)
    product: Product;
}

export class AccountTransfers {
    code: string;

    volume: number;

    notes: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'source_account', toClassOnly: true })
    sourceAccount: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'destination_account', toClassOnly: true })
    destinationAccount: string;

    @Transform((value) => value.code, { toClassOnly: true })
    @Expose({ name: 'destination_account', toClassOnly: true })
    transactionType: string;
}
