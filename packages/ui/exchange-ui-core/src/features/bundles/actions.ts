import { Bundle, CreateBundleDTO, BuyBundleDTO } from '../../utils/exchange';

export enum BundlesActionType {
    CREATE = 'EXCHANGE_APP_BUNDLES_CREATE',
    STORE = 'EXCHANGE_APP_BUNDLES_STORE',
    BUY = 'EXCHANGE_APP_BUNDLES_BUY',
    SHOW_DETAILS = 'EXCHANGE_APP_BUNDLES_SHOW_BUNDLE_DETAILS',
    CLEAR_BUNDLES = 'EXCHANGE_APP_BUNDLES_CLEAR_BUNDLES',
    CANCEL_BUNDLE = 'EXCHANGE_APP_BUNDLES_CANCEL_BUNDLE',
    FETCH_BUNDLES = 'EXCHANGE_APP_FETCH_BUNDLES'
}

export interface IBundleAction {
    type: BundlesActionType;
    payload?;
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

export const fetchBundles = (): IBundleAction => ({
    type: BundlesActionType.FETCH_BUNDLES
});
