import { Injectable } from '@nestjs/common';
import { DeviceService } from '@energyweb/origin-backend';

import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly deviceService: DeviceService) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getProduct(issuerId: string): ProductDTO {
        const product = new ProductDTO();
        product.deviceType = ['Solar;Photovoltaic;Classic silicon'];
        product.location = ['Thailand;Central;Nakhon Pathom'];
        product.deviceVintage = { year: 2016 };

        return product;
    }
}
