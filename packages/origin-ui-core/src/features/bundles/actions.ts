import { Bundle, CreateBundleDTO, BuyBundleDTO } from '../../utils/exchange';

export enum BundlesActionType {
    CREATE = 'BUNDLES_CREATE',
    STORE = 'BUNDLES_STORE',
    BUY = 'BUNDLES_BUY',
    SHOW_DETAILS = 'BUNDLES_SHOW_BUNDLE_DETAILS',
    CLEAR_BUNDLES = 'BUNDLES_CLREAR_BUNDLES',
    CANCEL_BUNDLE = 'BUNDLES_CANCEL_BUNDLE'
}

export interface IBundleAction {
    type: BundlesActionType;
    payload;
    callback?: () => void;
}

export interface ICreateBundleAction extends IBundleAction {
    payload: {
        bundleDTO: CreateBundleDTO;
        callback: () => void;
    };
}

export interface IStoreBundleAction extends IBundleAction {
    payload: Bundle;
}

export interface IBuyBundleAction extends IBundleAction {
    payload: {
        bundleDTO: BuyBundleDTO;
    };
}

export interface IShowBundleDetailsAction extends IBundleAction {
    payload: boolean;
}

export interface ICancelBundleAction extends IBundleAction {
    payload: string;
}

export const storeBundle = (payload: IStoreBundleAction['payload']) => ({
    type: BundlesActionType.STORE,
    payload
});

export const createBundle = (payload: ICreateBundleAction['payload']) => ({
    type: BundlesActionType.CREATE,
    payload
});

export const buyBundle = (payload: IBuyBundleAction['payload']) => ({
    type: BundlesActionType.BUY,
    payload
});

export const showBundleDetails = (payload: IShowBundleDetailsAction['payload']) => ({
    type: BundlesActionType.SHOW_DETAILS,
    payload
});

export const clearBundles = () => ({ type: BundlesActionType.CLEAR_BUNDLES });

export const cancelBundle = (payload: ICancelBundleAction['payload']) => ({
    type: BundlesActionType.CANCEL_BUNDLE,
    payload
});
