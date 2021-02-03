/* eslint-disable max-classes-per-file */
import { Transform, Type, Expose } from 'class-transformer';
import moment from 'moment-timezone';

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

    @Type(() => Asset)
    asset: Asset;

    @Type(() => Product)
    product: Product;
}

export class AccountItem {
    code: string;

    @Type(() => Item)
    items: Item[];
}
