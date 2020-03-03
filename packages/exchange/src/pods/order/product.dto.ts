// eslint-disable-next-line max-classes-per-file
import { DeviceVintage, Operator, Product } from '@energyweb/exchange-core';
import { Min, ValidateNested } from 'class-validator';

export class DeviceVintageDTO {
    @Min(1900)
    public year: number;

    public operator?: Operator;
}

export class ProductDTO {
    public deviceType?: string[];

    public location?: string[];

    @ValidateNested()
    public deviceVintage?: DeviceVintageDTO;

    public static toProduct(dto: ProductDTO): Product {
        return {
            ...dto,
            deviceVintage: dto.deviceVintage
                ? new DeviceVintage(dto.deviceVintage.year, dto.deviceVintage.operator)
                : null
        };
    }
}
