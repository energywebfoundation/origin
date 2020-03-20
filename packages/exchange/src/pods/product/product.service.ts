import { DeviceService } from '@energyweb/origin-backend';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
    private deviceService: DeviceService;

    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleInit() {
        this.deviceService = this.moduleRef.get(DeviceService, { strict: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getProduct(issuerId: string): ProductDTO {
        const product = new ProductDTO();
        product.deviceType = ['Solar;Photovoltaic;Classic silicon'];
        product.location = ['Thailand;Central;Nakhon Pathom'];
        product.deviceVintage = { year: 2016 };

        return product;
    }
}
