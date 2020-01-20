import { IRECDeviceService } from '@energyweb/utils-general';

import { Ask } from './Ask';
import { Order, OrderSide, OrderStatus } from './Order';
import { Product } from './Product';

export class Bid extends Order {
    constructor(id: string, price: number, volume: number, product: Product, validFrom: number) {
        super(id, OrderSide.Bid, OrderStatus.Active, validFrom, product, price, volume);
    }

    public filterBy(product: Product, deviceService: IRECDeviceService): boolean {
        const hasMatchingDeviceType = this.isIncludedInDeviceType(product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(product);

        return hasMatchingDeviceType && hasMatchingVintage;
    }

    public matches(ask: Ask, deviceService: IRECDeviceService): boolean {
        const hasMatchingDeviceType = this.hasMatchingDeviceType(ask.product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(ask.product);

        return hasMatchingDeviceType && hasMatchingVintage;
    }

    private hasMatchingDeviceType(product: Product, deviceService: IRECDeviceService) {
        if (!this.product.deviceType || !product.deviceType) {
            return true;
        }

        return deviceService.includesDeviceType(product.deviceType[0], this.product.deviceType);
    }

    private isIncludedInDeviceType(product: Product, deviceService: IRECDeviceService) {
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
        return this.product.deviceVintage >= product.deviceVintage;
    }
}
