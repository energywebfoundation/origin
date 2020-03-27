import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import BN from 'bn.js';

import { Bid } from './Bid';
import { Order, OrderSide, OrderStatus } from './Order';
import { Product } from './Product';
import { Filter, ProductFilter } from './ProductFilter';

export class Ask extends Order {
    constructor(
        id: string,
        price: number,
        volume: BN,
        product: Product,
        validFrom: Date,
        status: OrderStatus,
        userId: string
    ) {
        super(id, OrderSide.Ask, status, validFrom, product, price, volume, userId);

        if (product.deviceType?.length !== 1) {
            throw new Error('Unable to create ask order. DeviceType has to be specified');
        }
        if (!product.generationTime) {
            throw new Error(
                'Unable to create ask order. GenerationTime has to be specified as single TimeRange'
            );
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

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime
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

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime
        );
    }

    public clone() {
        return new Ask(
            this.id,
            this.price,
            this.volume,
            this.product,
            this.validFrom,
            this.status,
            this.userId
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
}
