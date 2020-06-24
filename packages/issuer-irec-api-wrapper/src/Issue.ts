/* eslint-disable max-classes-per-file */
import { Expose, Transform } from 'class-transformer';
import { IsDate, IsPositive, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class Issue {
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
    @IsDate()
    start: Date;

    @Expose({ name: 'end_date', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    end: Date;

    @Expose({ name: 'period_production', toPlainOnly: true })
    @Transform((value: number) => value.toString(), { toPlainOnly: true })
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
