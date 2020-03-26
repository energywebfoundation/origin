import { DeviceService } from '@energyweb/origin-backend';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { AssetService } from '../asset/asset.service';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
    private deviceService: DeviceService;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly assetService: AssetService
    ) {}

    public async onModuleInit() {
        this.deviceService = this.moduleRef.get(DeviceService, { strict: false });
    }

    public async getProduct(assetId: string): Promise<ProductDTO> {
        const { generationFrom, generationTo } = await this.assetService.get(assetId);

        return {
            deviceType: ['Solar;Photovoltaic;Classic silicon'],
            location: ['Thailand;Central;Nakhon Pathom'],
            deviceVintage: { year: 2016 },
            generationFrom: generationFrom.toISOString(),
            generationTo: generationTo.toISOString()
        };
    }
}
