import { Expose, Type, Transform } from 'class-transformer';
import {
    ValidateNested,
    IsNotEmpty,
    IsString,
    IsPositive,
    IsOptional,
    IsNumber,
    IsDate
} from 'class-validator';

export class ReservationItem {
    @Expose({ name: 'item_code', toPlainOnly: true })
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsPositive()
    amount: number;
}

export class Transfer {
    @Expose({ name: 'source_account_code', toPlainOnly: true })
    @IsNotEmpty()
    @IsString()
    sender: string;

    @Expose({ name: 'destination_account_code', toPlainOnly: true })
    @IsNotEmpty()
    @IsString()
    recipient: string;

    @Expose({ name: 'approver_username', toPlainOnly: true })
    @IsNotEmpty()
    @IsString()
    approver: string;

    @Expose({ name: 'rqd_volume', toPlainOnly: true })
    get total(): number {
        return this.items.reduce((sum, v) => sum + v.amount, 0);
    }

    @Expose({ name: 'reservation_items', toPlainOnly: true })
    @Type(() => ReservationItem)
    @ValidateNested()
    items: ReservationItem[];

    @IsOptional()
    @IsString()
    notes?: string;
}

export class Redemption extends Transfer {
    @IsNumber()
    @Expose({ name: 'beneficiary_id', toPlainOnly: true })
    beneficiary: number;

    @Expose({ name: 'period_start', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    start: Date;

    @Expose({ name: 'period_end', toPlainOnly: true })
    @Transform((value: Date) => value.toISOString().split('T')[0], { toPlainOnly: true })
    @IsDate()
    end: Date;

    @IsString()
    @IsNotEmpty()
    purpose: string;
}
