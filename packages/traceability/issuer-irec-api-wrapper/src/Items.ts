import { Expose, Transform } from 'class-transformer';
import moment from 'moment-timezone';
import { IsNotEmpty, IsString } from 'class-validator';

import { Product } from './Product';

export class Asset {
    code: string;

    @Transform((value) => value.code, { toClassOnly: true })
    fuel: string;

    @Transform((value) => value.alpha2, { toClassOnly: true })
    country: string;

    @Expose({ name: 'start_date', toClassOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    start: Date;

    @Expose({ name: 'end_date', toClassOnly: true })
    @Transform((value) => moment.tz(value.date, value.timezone).toDate())
    end: Date;

    @Expose({ name: 'device_supported', toClassOnly: true })
    supportedDevice: boolean;

    @Expose({ name: 'tagged', toClassOnly: true })
    isTagged: boolean;

    @Expose({ name: 'co2_produced', toClassOnly: true })
    @Transform((value) => Number(value))
    co2Produced: number;
}

export class Item {
    code: string;

    volume: number;

    asset: Asset;

    product: Product;
}

export class AccountItem {
    code: string;

    items: Item[];
}

export class CodeName {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}
