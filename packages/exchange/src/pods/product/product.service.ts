import { Injectable } from '@nestjs/common';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getProduct(deviceId: string): ProductDTO {
        return {
            deviceType: ['Solar;Photovoltaic;Classic silicon'],
            location: ['Thailand;Central;Nakhon Pathom'],
            deviceVintage: { year: 2016 }
        };
    }
}
