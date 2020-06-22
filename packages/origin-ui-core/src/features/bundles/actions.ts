import { Bundle, CreateBundleDTO, BuyBundleDTO } from '../../utils/exchange';

export enum BundlesActionType {
    CREATE = 'BUNDLES_CREATE',
    STORE = 'BUNDLES_STORE',
    BUY = 'BUNDLES_BUY',
    SHOW_BUNDLE_DETAILS = 'BUNDLES_SHOW_BUNDLE_DETAILS'
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

export const storeBundle = (payload: IStoreBundleAction['payload']) => {
    return {
        type: BundlesActionType.STORE,
        payload
    };
};

export const createBundle = (payload: ICreateBundleAction['payload']) => {
    return {
        type: BundlesActionType.CREATE,
        payload
    };
};

export const buyBundle = (payload: IBuyBundleAction['payload']) => {
    return {
        type: BundlesActionType.BUY,
        payload
    };
};

export const showBundleDetails = (payload: IShowBundleDetailsAction['payload']) => {
    return {
        type: BundlesActionType.SHOW_BUNDLE_DETAILS,
        payload
    };
};
