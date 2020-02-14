import { DeviceVintage, Operator, Product } from '@energyweb/exchange-core';

export type DeviceVintageDTO = {
    year: number;
    operator?: Operator;
};

export class ProductDTO {
    public deviceType?: string[];

    public location?: string[];

    public deviceVintage?: DeviceVintageDTO;

    public static toProduct(product: ProductDTO): Product {
        return {
            ...product,
            deviceVintage: product.deviceVintage
                ? new DeviceVintage(product.deviceVintage.year, product.deviceVintage.operator)
                : null
        };
    }
}
