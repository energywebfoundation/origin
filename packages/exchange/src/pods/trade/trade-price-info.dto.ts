import BN from 'bn.js';
import { Transform } from 'class-transformer';

import { ProductDTO } from '../order/product.dto';

export class TradePriceInfoDTO {
    constructor(partial: Partial<TradePriceInfoDTO>) {
        Object.assign(this, partial);
    }

    public created: Date;

    @Transform((value: BN) => value.toString(10))
    public volume: BN;

    public price: number;

    public product: ProductDTO;

    public assetId: string;
}
