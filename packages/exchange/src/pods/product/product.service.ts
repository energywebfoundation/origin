import { DeviceService } from '@energyweb/origin-backend';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { AssetService } from '../asset/asset.service';
import { ProductDTO } from '../order/product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
    private readonly logger = new Logger(ProductService.name);

    private deviceService: DeviceService;

    private issuerTypeId: string;

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly assetService: AssetService,
        private readonly configService: ConfigService
    ) {
        this.issuerTypeId = this.configService.get<string>('ISSUER_ID');
    }

    public async onModuleInit() {
        this.deviceService = this.moduleRef.get(DeviceService, { strict: false });
    }

    public async getProduct(assetId: string): Promise<ProductDTO> {
        this.logger.debug(`Requested product for asset ${assetId}`);

        const { generationFrom, generationTo, deviceId } = await this.assetService.get(assetId);
        const externalDeviceId = {
            id: deviceId,
            type: this.issuerTypeId
        };
        const deviceProductInfo = await this.deviceService.findDeviceProductInfo(externalDeviceId);

        if (!deviceProductInfo) {
            this.logger.error(
                `Unable to resolve device product info for ${JSON.stringify(externalDeviceId)} `
            );
            throw new Error('Missing device info');
        }
        const location = [
            `${deviceProductInfo.country};${deviceProductInfo.region};${deviceProductInfo.province}`
        ];

        const product = {
            deviceType: [deviceProductInfo.deviceType],
            location,
            deviceVintage: { year: deviceProductInfo.operationalSince },
            generationFrom: generationFrom.toISOString(),
            generationTo: generationTo.toISOString(),
            gridOperator: [deviceProductInfo.gridOperator]
        };

        this.logger.debug(`Returning ${JSON.stringify(product)}`);

        return product;
    }
}
