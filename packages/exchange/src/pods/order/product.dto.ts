import { Operator } from '@energyweb/exchange-core';

export type DeviceVintageDTO = {
    year: number;
    operator: Operator;
};

export class ProductDTO {
    public deviceType: string[];

    public location: string[];

    public deviceVintage: DeviceVintageDTO;
}
