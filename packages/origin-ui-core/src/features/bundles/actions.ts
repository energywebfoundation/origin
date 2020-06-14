import { Bundle } from '../../utils/exchange';

export enum BundlesActionType {
    STORE = 'BUNDLES_STORE'
}

export interface IBundleAction {
    type: BundlesActionType;
    payload: Bundle;
}

export const storeBundle = (bundle: Bundle) => {
    return {
        type: BundlesActionType.STORE,
        payload: bundle
    };
};
