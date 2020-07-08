import { IStoreState } from '../../types';

export const getBundles = (state: IStoreState) => state.bundles.bundles;

export const getShowBundleDetails = (state: IStoreState) => state.bundles.showBundleDetails;
