import BN from 'bn.js';
import { Transform, Type } from 'class-transformer';

import { Asset } from '../asset/asset.entity';

export class AccountAsset {
    @Type(() => Asset)
    public asset: Asset;

    @Transform((value: BN) => value.toString(10))
    public amount: BN;

    public constructor(accountAsset: Partial<AccountAsset>) {
        Object.assign(this, accountAsset);
    }
}
