import { AssetAmount } from '../../account-balance';

export class HasEnoughAssetAmountQuery {
    constructor(public readonly userId: string, public readonly assets: AssetAmount[]) {}
}
