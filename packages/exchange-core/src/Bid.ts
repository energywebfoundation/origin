import { IDeviceService, ILocationService } from '@energyweb/utils-general';

import { Ask } from './Ask';
import { Order, OrderSide, OrderStatus } from './Order';
import { Product } from './Product';

export class Bid extends Order {
    constructor(
        id: string,
        price: number,
        volume: number,
        product: Product,
        validFrom: Date,
        status: OrderStatus
    ) {
        super(id, OrderSide.Bid, status, validFrom, product, price, volume);
    }

    public filterBy(
        product: Product,
        deviceService: IDeviceService,
        locationService: ILocationService
    ): boolean {
        const isIncludedInDeviceType = this.isIncludedInDeviceType(product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(product);
        const isIncludedInLocation = this.isIncludedInLocation(product, locationService);

        return isIncludedInDeviceType && hasMatchingVintage && isIncludedInLocation;
    }

    public matches(
        ask: Ask,
        deviceService: IDeviceService,
        locationService: ILocationService
    ): boolean {
        const hasMatchingDeviceType = this.hasMatchingDeviceType(ask.product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(ask.product);
        const hasMatchingLocation = this.hasMatchingLocation(ask.product, locationService);

        return hasMatchingDeviceType && hasMatchingVintage && hasMatchingLocation;
    }

    public clone() {
        return new Bid(this.id, this.price, this.volume, this.product, this.validFrom, this.status);
    }

    private hasMatchingDeviceType(product: Product, deviceService: IDeviceService) {
        if (!this.product.deviceType || !product.deviceType) {
            return true;
        }

        return deviceService.includesDeviceType(product.deviceType[0], this.product.deviceType);
    }

    private hasMatchingLocation(product: Product, locationService: ILocationService) {
        if (!this.product.location || !product.location) {
            return true;
        }

        return locationService.matches(this.product.location, product.location[0]);
    }

    private isIncludedInLocation(product: Product, locationService: ILocationService) {
        if (!this.product.location || !product.location) {
            return true;
        }

        return (
            locationService.matches(product.location, this.product.location[0]) ||
            locationService.matches(this.product.location, product.location[0])
        );
    }

    private isIncludedInDeviceType(product: Product, deviceService: IDeviceService) {
        if (!this.product.deviceType || !product.deviceType) {
            return true;
        }

        return (
            deviceService.includesSomeDeviceType(product.deviceType, this.product.deviceType) ||
            deviceService.includesSomeDeviceType(this.product.deviceType, product.deviceType)
        );
    }

    private hasMatchingVintage(product: Product) {
        if (!product.deviceVintage || !this.product.deviceVintage) {
            return true;
        }
        return this.product.deviceVintage <= product.deviceVintage;
    }
}
