import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { CreateBidDTO } from '../order/create-bid.dto';

export class DemandSummaryDTO {
    constructor(bids: CreateBidDTO[]) {
        this.bids = bids;
    }

    @Expose()
    bids: CreateBidDTO[];

    @Transform((v: BN) => v.toString(10))
    @Expose()
    get volume(): BN {
        return this.bids.reduce((sum: BN, item) => sum.add(new BN(item.volume)), new BN(0));
    }
}
