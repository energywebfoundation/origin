import { GetMappedOrderQuery } from '@energyweb/exchange';
import { IMatchableOrder, Order, OrderSide } from '@energyweb/exchange-core';
import {
    IRECProduct,
    IRECProductFilter,
    AskProduct,
    BidProduct
} from '@energyweb/exchange-core-irec';
import { LocationService } from '@energyweb/utils-general';
import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductDTO } from '../product';
import { DeviceTypeServiceWrapper } from '../runner';

@QueryHandler(GetMappedOrderQuery)
export class GetMappedOrderHandler implements IQueryHandler<GetMappedOrderQuery> {
    private readonly logger = new Logger(GetMappedOrderHandler.name);

    private locationService = new LocationService();

    constructor(private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper) {}

    async execute({
        order
    }: GetMappedOrderQuery): Promise<IMatchableOrder<IRECProduct, IRECProductFilter>> {
        this.logger.log(`Mapping order query`);

        const irecProduct = ProductDTO.toProduct(order.product);
        const product =
            order.side === OrderSide.Ask
                ? new AskProduct(
                      irecProduct,
                      this.deviceTypeServiceWrapper.deviceTypeService,
                      this.locationService
                  )
                : new BidProduct(
                      irecProduct,
                      this.deviceTypeServiceWrapper.deviceTypeService,
                      this.locationService
                  );

        return new Order(
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
