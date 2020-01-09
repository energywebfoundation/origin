import { IRECDeviceService } from '@energyweb/utils-general';
import { Product } from './Product';

export enum OrderSide {
    Bid,
    Ask
}

export enum OrderStatus {
    Active,
    Cancelled,
    Filled,
    PartiallyFilled
}

export class Order {
    private _volume: number;

    private _status: OrderStatus;

    public get volume() {
        return this._volume;
    }

    public get status() {
        return this._status;
    }

    private constructor(
        public readonly id: string,
        public readonly side: OrderSide,
        status: OrderStatus,
        public readonly validFrom: number,
        public readonly product: Product,
        public readonly price: number,
        volume: number
    ) {
        this._status = status;
        this._volume = volume;
    }

    public matches(order: Order, deviceService: IRECDeviceService) {
        if (!order.product.assetType || this.product.assetType) {
            return true;
        }

        const { askAssetType, bidAssetType } =
            this.side === OrderSide.Ask
                ? { askAssetType: this.product.assetType[0], bidAssetType: order.product.assetType }
                : {
                      askAssetType: order.product.assetType[0],
                      bidAssetType: this.product.assetType
                  };

        return deviceService.includesDeviceType(askAssetType, bidAssetType);
    }

    public updateVolume(traded: number) {
        if (traded > this.volume) {
            throw new Error('Order overmatched');
        }
        this._volume -= traded;
        this._status = this.volume === 0 ? OrderStatus.Filled : OrderStatus.PartiallyFilled;

        return this;
    }

    public static createBid(
        id: string,
        price: number,
        volume: number,
        product: Product,
        validFrom: number
    ): Order {
        return new Order(id, OrderSide.Bid, OrderStatus.Active, validFrom, product, price, volume);
    }

    public static createAsk(
        id: string,
        price: number,
        volume: number,
        product: Product,
        validFrom: number
    ): Order {
        if (product.assetType?.length !== 1) {
            throw new Error('Unable to create ask order. AssetType has to be specified');
        }
        return new Order(id, OrderSide.Ask, OrderStatus.Active, validFrom, product, price, volume);
    }
}
