import BN from 'bn.js';

import { Order } from './Order';

export class OneTimeMatchOrder<TProduct, TProductFilter> extends Order<TProduct, TProductFilter> {
    private matched = false;

    public get isFilled() {
        return this.volume.isZero() || this.matched;
    }

    public updateWithTradedVolume(tradedVolume: BN) {
        super.updateWithTradedVolume(tradedVolume);
        this.matched = true;

        return this;
    }

    public clone(): OneTimeMatchOrder<TProduct, TProductFilter> {
        return new OneTimeMatchOrder(
            this.id,
            this.side,
            this.validFrom,
            this.matchableProduct,
            this.price,
            this.volume,
            this.userId,
            this.createdAt,
            this.assetId
        );
    }
}
