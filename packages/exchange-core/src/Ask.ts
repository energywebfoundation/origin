import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import BN from 'bn.js';

import { Bid } from './Bid';
import { Order, OrderSide } from './Order';
import { Product } from './Product';
import { Filter, ProductFilter } from './ProductFilter';

export class Ask extends Order {
    constructor(
        id: string,
        price: number,
        volume: BN,
        product: Product,
        validFrom: Date,
        userId: string,
        public readonly assetId: string,
        createdAt: Date
    ) {
        super(id, OrderSide.Ask, validFrom, product, price, volume, userId, createdAt);

        if (product.deviceType?.length !== 1) {
            throw new Error('Unable to create ask order. DeviceType has to be specified');
        }
        if (!product.generationTime) {
            throw new Error(
                'Unable to create ask order. GenerationTime has to be specified as single TimeRange'
            );
        }
        if (product.gridOperator && product.gridOperator.length > 1) {
            throw new Error('Unable to create ask order. GridOperator has to be not set or 1');
        }
    }

    private get deviceType() {
        return this.product.deviceType[0];
    }

    private get location() {
        return this.product.location[0];
    }

    public filterBy(
        productFilter: ProductFilter,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const hasMatchingDeviceType = this.filterByDeviceType(productFilter, deviceService);
        const hasMatchingVintage = this.filterByDeviceVintage(productFilter);
        const hasMatchingLocation = this.filterByLocation(productFilter, locationService);
        const hasMatchingGenerationTime = this.filterByGenerationTime(productFilter);
        const hasMatchingGridOperator = this.filterByGridOperator(productFilter);

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime &&
            hasMatchingGridOperator
        );
    }

    public matches(
        bid: Bid,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const { product } = bid;

        const hasMatchingDeviceType = this.hasMatchingDeviceType(product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(product);
        const hasMatchingLocation = this.hasMatchingLocation(product, locationService);
        const hasMatchingGenerationTime = this.hasMatchingGenerationTime(bid);
        const hasMatchingGridOperator = this.hasMatchingGridOperator(product);

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime &&
            hasMatchingGridOperator
        );
    }

    public clone(): Ask {
        return new Ask(
            this.id,
            this.price,
            this.volume,
            this.product,
            this.validFrom,
            this.userId,
            this.assetId,
            this.createdAt
        );
    }

    private filter(filter: Filter, pred: () => boolean) {
        if (filter === Filter.All || filter === Filter.Unspecified) {
            return true;
        }

        return pred();
    }

    private filterByDeviceType(productFilter: ProductFilter, deviceService: IDeviceTypeService) {
        return this.filter(productFilter.deviceTypeFilter, () =>
            deviceService.includesDeviceType(this.deviceType, productFilter.deviceType)
        );
    }

    private filterByLocation(productFilter: ProductFilter, locationService: ILocationService) {
        return this.filter(productFilter.locationFilter, () =>
            locationService.matches(productFilter.location, this.location)
        );
    }

    private filterByDeviceVintage(productFilter: ProductFilter) {
        return this.filter(productFilter.deviceVintageFilter, () =>
            this.product.deviceVintage.matches(productFilter.deviceVintage)
        );
    }

    private filterByGenerationTime(productFilter: ProductFilter) {
        return this.filter(productFilter.generationTimeFilter, () =>
            Order.hasMatchingGenerationTimes(productFilter, this.product)
        );
    }

    private filterByGridOperator(productFilter: ProductFilter) {
        return this.filter(productFilter.gridOperatorFilter, () =>
            productFilter.gridOperator.some(
                (bidGridOperator) => bidGridOperator === this.product.gridOperator[0]
            )
        );
    }

    private hasMatchingDeviceType(product: Product, deviceService: IDeviceTypeService) {
        if (!product.deviceType?.length) {
            return true;
        }

        return deviceService.includesDeviceType(this.deviceType, product.deviceType);
    }

    private hasMatchingVintage(product: Product) {
        if (!product.deviceVintage || !this.product.deviceVintage) {
            return true;
        }
        return this.product.deviceVintage.matches(product.deviceVintage);
    }

    private hasMatchingLocation(product: Product, locationService: ILocationService) {
        if (!product.location?.length) {
            return true;
        }

        return locationService.matches(product.location, this.location);
    }

    private hasMatchingGenerationTime(bid: Bid) {
        if (!bid.product.generationTime) {
            return true;
        }

        return Order.hasMatchingGenerationTimes(bid.product, this.product);
    }

    private hasMatchingGridOperator(product: Product) {
        if (!this.product.gridOperator?.length || !product.gridOperator?.length) {
            return true;
        }

        return product.gridOperator.some(
            (bidGridOperator) => bidGridOperator === this.product.gridOperator[0]
        );
    }
}
