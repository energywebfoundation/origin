import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
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

    product: Product;
}

export class Transaction {
    code: string;

    @Transform((value) => parseFloat(value), { toClassOnly: true })
    volume: number;

    notes: string;

    @Expose({ name: 'source_account', toClassOnly: true })
    sender: string;

    @Expose({ name: 'destination_account', toClassOnly: true })
    recipient: string;

    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    time: Date;

    @Expose({ name: 'type', toClassOnly: true })
    transactionType: TransactionType;
}

export class ApproveTransaction extends Transaction {
    asset: string;
}

export class TransactionResult extends Transaction {
    @Expose({ name: 'type', toClassOnly: true })
    transactionType: TransactionType;

    @Expose({ name: 'source_account', toClassOnly: true })
    sender: string;

    @Expose({ name: 'destination_account', toClassOnly: true })
    recipient: string;
}

export class RedeemBeneficiary {
    id: number;

    name: string;
}

export class RedeemTransaction extends Transaction {
    purpose: string;

    beneficiary: RedeemBeneficiary;

    @Expose({ name: 'period_start', toPlainOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    start: Date;

    @Expose({ name: 'period_end', toPlainOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    end: Date;
}

export class RedeemTransactionResult extends TransactionResult {
    @Expose({ name: 'encrypted_key', toClassOnly: true })
    encryptedKey: string;

    @Expose({ name: 'verification_key', toClassOnly: true })
    verificationKey: string;
}
