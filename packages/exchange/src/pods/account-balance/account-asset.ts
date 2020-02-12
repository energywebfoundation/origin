import BN from 'bn.js';

import { Asset } from '../asset/asset.entity';

export class AccountAsset {
    public asset: Asset;

    public amount: BN;
}
