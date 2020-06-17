import { Bundle, CreateBundleDTO } from '../../utils/exchange';

export enum BundlesActionType {
    CREATE = 'BUNDLES_CREATE',
    STORE = 'BUNDLES_STORE'
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
