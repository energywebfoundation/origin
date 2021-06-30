import { Expose, Transform } from 'class-transformer';
import moment from 'moment-timezone';
import { IsNotEmpty, IsString } from 'class-validator';

import { Product } from './Product';

export class CodeName {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CodeDescription {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class AccountItem {
    code: string;

    @Transform((value: number) => String(value), { toPlainOnly: true })
    @Transform((value: string) => Number(value), { toClassOnly: true })
    volume: number;

    @Expose({ name: 'start_date', toClassOnly: true })
    startDate: string;

    @Expose({ name: 'end_date', toClassOnly: true })
    endDate: string;

    @Expose({ name: 'fuel', toClassOnly: true })
    fuelType: CodeDescription;

    @Expose({ name: 'type', toClassOnly: true })
    deviceType: CodeDescription;

    device: CodeName;

    @Expose({ name: 'device_supported', toClassOnly: true })
    deviceSupported: boolean;

    tagged: boolean;

    @Expose({ name: 'co2_produced', toClassOnly: true })
    @Transform((value: number) => String(value), { toPlainOnly: true })
    @Transform((value: string) => Number(value), { toClassOnly: true })
    co2Produced: number;

    country: string;

    product: string;
}
