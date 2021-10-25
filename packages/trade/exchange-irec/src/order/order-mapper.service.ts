import { IOrderMapperService, Order } from '@energyweb/exchange';
import { IMatchableOrder, OrderSide, Order as MatchingEngineOrder } from '@energyweb/exchange-core';
import {
    AskProduct,
    BidProduct,
    IRECProduct,
    IRECProductFilter
} from '@energyweb/exchange-core-irec';
import { LocationService } from '@energyweb/utils-general';
import { Injectable, Logger } from '@nestjs/common';

import { ProductDTO } from '../product';
import { DeviceTypeServiceWrapper } from '../runner';

@Injectable()
export class OrderMapperService implements IOrderMapperService<IRECProduct, IRECProductFilter> {
    private readonly logger = new Logger(OrderMapperService.name);

    private locationService = new LocationService();

    constructor(private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper) {}

    async map(order: Order): Promise<IMatchableOrder<IRECProduct, IRECProductFilter>> {
        this.logger.debug(`Mapping order to matching engine order: ${JSON.stringify(order)}`);

        const irecProduct = ProductDTO.toProduct(order.product);
        const deviceTypeService = await this.deviceTypeServiceWrapper.getDeviceTypeService();

        const product =
            order.side === OrderSide.Ask
                ? new AskProduct(irecProduct, deviceTypeService, this.locationService)
                : new BidProduct(irecProduct, deviceTypeService, this.locationService);

        return new MatchingEngineOrder(
            order.id,
            order.side,
            order.validFrom,
            product,
            order.price,
            order.currentVolume,
            order.userId,
            order.createdAt,
            order.assetId
        );
    }
}
