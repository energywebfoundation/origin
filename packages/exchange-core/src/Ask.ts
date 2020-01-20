import { IRECDeviceService } from '@energyweb/utils-general';
import { Order, OrderStatus, OrderSide } from './Order';
import { Product } from './Product';
import { Bid } from './Bid';

export class Ask extends Order {
    constructor(id: string, price: number, volume: number, product: Product, validFrom: number) {
        super(id, OrderSide.Ask, OrderStatus.Active, validFrom, product, price, volume);

        if (product.deviceType?.length !== 1) {
            throw new Error('Unable to create ask order. AssetType has to be specified');
        }
    }

    public filterBy(product: Product, deviceService: IRECDeviceService): boolean {
        const hasMatchingDeviceType = this.hasMatchingDeviceType(product, deviceService);
        const hasMatchingVintage = this.hasMatchingVintage(product);

        return hasMatchingDeviceType && hasMatchingVintage;
    }

    public matches(bid: Bid, deviceService: IRECDeviceService): boolean {
        return this.filterBy(bid.product, deviceService);
    }

    private hasMatchingDeviceType(product: Product, deviceService: IRECDeviceService) {
        if (!product.deviceType) {
            return true;
        }

        return deviceService.includesDeviceType(this.product.deviceType[0], product.deviceType);
    }

    private hasMatchingVintage(product: Product) {
        if (!product.deviceVintage || !this.product.deviceVintage) {
            return true;
        }
        return this.product.deviceVintage <= product.deviceVintage;
    }
}
