import BN from 'bn.js';
import { OrderSide } from './OrderSide';

export interface IOrder {
    id: string;
    side: OrderSide;
    validFrom: Date;
    price: number;
    volume: BN;
    userId: string;
    isFilled: boolean;
    createdAt: Date;
    assetId?: string;
}
