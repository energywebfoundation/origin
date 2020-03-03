import { Injectable } from '@nestjs/common';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getProduct(deviceId: string): ProductDTO {
        const product = new ProductDTO();
        product.deviceType = ['Solar;Photovoltaic;Classic silicon'];
        product.location = ['Thailand;Central;Nakhon Pathom'];
        product.deviceVintage = { year: 2016 };

        return product;
    }
}
