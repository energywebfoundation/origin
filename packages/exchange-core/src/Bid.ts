import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import BN from 'bn.js';

import { Ask } from './Ask';
import { Order, OrderSide, OrderStatus } from './Order';
import { Product } from './Product';
import { ProductFilter, Filter } from './ProductFilter';

export class Bid extends Order {
    constructor(
        id: string,
        price: number,
        volume: BN,
        product: Product,
        validFrom: Date,
        status: OrderStatus,
        userId: string
    ) {
        super(id, OrderSide.Bid, status, validFrom, product, price, volume, userId);
    }

    public filterBy(
        productFilter: ProductFilter,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const isIncludedInDeviceType = this.isIncludedInDeviceType(productFilter, deviceService);
        const hasMatchingVintage = this.filterByDeviceVintage(productFilter);
        const isIncludedInLocation = this.isIncludedInLocation(productFilter, locationService);

        return isIncludedInDeviceType && hasMatchingVintage && isIncludedInLocation;
    }

    public matches(
        ask: Ask,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const hasMatchingDeviceType = this.hasMatchingDeviceType(ask.product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(ask.product);
        const hasMatchingLocation = this.hasMatchingLocation(ask.product, locationService);

        return hasMatchingDeviceType && hasMatchingVintage && hasMatchingLocation;
    }

    public clone() {
        return new Bid(
            this.id,
            this.price,
            this.volume,
            this.product,
            this.validFrom,
            this.status,
            this.userId
        );
    }

    private hasMatchingDeviceType(product: Product, deviceService: IDeviceTypeService) {
        if (!this.product.deviceType?.length || !product.deviceType?.length) {
            return true;
        }

        return deviceService.includesDeviceType(product.deviceType[0], this.product.deviceType);
    }

    private hasMatchingLocation(product: Product, locationService: ILocationService) {
        if (!this.product.location?.length || !product.location?.length) {
            return true;
        }

        return locationService.matches(this.product.location, product.location[0]);
    }

    private isIncludedInLocation(productFilter: ProductFilter, locationService: ILocationService) {
        if (productFilter.locationFilter === Filter.All) {
            return true;
        }
        if (productFilter.locationFilter === Filter.Unspecified) {
            return !this.product.location?.length;
        }

        return (
            locationService.matchesSome(productFilter.location, this.product.location) ||
            locationService.matchesSome(this.product.location, productFilter.location)
        );
    }

    private isIncludedInDeviceType(
        productFilter: ProductFilter,
        deviceService: IDeviceTypeService
    ) {
        if (productFilter.deviceTypeFilter === Filter.All) {
            return true;
        }
        if (productFilter.deviceTypeFilter === Filter.Unspecified) {
            return !this.product.deviceType?.length;
        }

        return (
            deviceService.includesSomeDeviceType(
                productFilter.deviceType,
                this.product.deviceType
            ) ||
            deviceService.includesSomeDeviceType(this.product.deviceType, productFilter.deviceType)
        );
    }

    private filterByDeviceVintage(productFilter: ProductFilter) {
        if (productFilter.deviceVintageFilter === Filter.All) {
            return true;
        }
        if (productFilter.deviceVintageFilter === Filter.Unspecified) {
            return !this.product.deviceVintage;
        }

        return productFilter.deviceVintage.matches(this.product.deviceVintage);
    }

    private hasMatchingVintage(product: Product) {
        if (!this.product.deviceVintage || !product.deviceVintage) {
            return true;
        }
        return product.deviceVintage.matches(this.product.deviceVintage);
    }
}
