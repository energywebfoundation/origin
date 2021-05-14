import { Expose, Transform } from 'class-transformer';
import { IsDate, IsPositive, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { FileIds } from './File';

export enum IssueStatus {
    Draft = 'Draft',
    InProgress = 'In-progress',
    Rejected = 'Rejected',
    Withdrawn = 'Withdrawn',
    Submitted = 'Submitted',
    Referred = 'Referred',
    Verified = 'Verified',
    Approved = 'Approved',
    Issued = 'Issued'
}

export class Issue extends FileIds {
    @Expose({ name: 'device_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    device: string;

    @Expose({ name: 'fuel_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    fuel: string;

    @Expose({ name: 'recipient_account_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    recipient: string;

    @Expose({ name: 'start_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    start: Date;

    @Expose({ name: 'end_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @Transform((value: string) => new Date(value), { toClassOnly: true })
    @IsDate()
    end: Date;

    @Expose({ name: 'period_production', toPlainOnly: true })
    @Transform((value: number) => value.toString(), { toPlainOnly: true })
    @Transform((value: string) => parseFloat(value), { toClassOnly: true })
    @IsPositive()
    production: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class ApproveIssue {
    @Expose({ name: 'issuer_account_code', toPlainOnly: true })
    @IsString()
    @IsNotEmpty()
    issuer: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class IssueWithStatus extends Issue {
    code: string;

    status: IssueStatus;
}
