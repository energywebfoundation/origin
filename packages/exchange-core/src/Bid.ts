import { IDeviceTypeService, ILocationService } from '@energyweb/utils-general';
import BN from 'bn.js';

import { Ask } from './Ask';
import { Order, OrderSide } from './Order';
import { Product } from './Product';
import { Filter, ProductFilter } from './ProductFilter';

export class Bid extends Order {
    constructor(
        id: string,
        price: number,
        volume: BN,
        product: Product,
        validFrom: Date,
        userId: string
    ) {
        super(id, OrderSide.Bid, validFrom, product, price, volume, userId);
    }

    public filterBy(
        productFilter: ProductFilter,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const isIncludedInDeviceType = this.isIncludedInDeviceType(productFilter, deviceService);
        const hasMatchingVintage = this.filterByDeviceVintage(productFilter);
        const isIncludedInLocation = this.isIncludedInLocation(productFilter, locationService);
        const hasMatchingGenerationTime = this.filterByGenerationTime(productFilter);

        return (
            isIncludedInDeviceType &&
            hasMatchingVintage &&
            isIncludedInLocation &&
            hasMatchingGenerationTime
        );
    }

    public matches(
        ask: Ask,
        deviceService: IDeviceTypeService,
        locationService: ILocationService
    ): boolean {
        const { product } = ask;

        const hasMatchingDeviceType = this.hasMatchingDeviceType(product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(product);
        const hasMatchingLocation = this.hasMatchingLocation(product, locationService);
        const hasMatchingGenerationTime = this.hasMatchingGenerationTime(ask);

        return (
            hasMatchingDeviceType &&
            hasMatchingVintage &&
            hasMatchingLocation &&
            hasMatchingGenerationTime
        );
    }

    public clone() {
        return new Bid(this.id, this.price, this.volume, this.product, this.validFrom, this.userId);
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

        if (!this.product.location?.length) {
            return false;
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

        if (!this.product.deviceType?.length) {
            return false;
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

        if (!this.product.deviceVintage) {
            return false;
        }

        return productFilter.deviceVintage.matches(this.product.deviceVintage);
    }

    private filterByGenerationTime(productFilter: ProductFilter) {
        if (productFilter.generationTimeFilter === Filter.All) {
            return true;
        }
        if (productFilter.generationTimeFilter === Filter.Unspecified) {
            return !this.product.generationTime;
        }

        if (!this.product.generationTime) {
            return false;
        }

        return Order.hasMatchingGenerationTimes(this.product, productFilter);
    }

    private hasMatchingVintage(product: Product) {
        if (!this.product.deviceVintage || !product.deviceVintage) {
            return true;
        }
        return product.deviceVintage.matches(this.product.deviceVintage);
    }

    private hasMatchingGenerationTime(ask: Ask) {
        if (!this.product.generationTime) {
            return true;
        }

        return Order.hasMatchingGenerationTimes(this.product, ask.product);
    }
}
