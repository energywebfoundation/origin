import { IStoreState } from '../../types';

export const getBundles = (state: IStoreState) => state.bundlesState.bundles;

export const getShowBundleDetails = (state: IStoreState) => state.bundlesState.showBundleDetails;
