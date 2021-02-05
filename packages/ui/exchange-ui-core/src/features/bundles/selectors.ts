import { IExchangeState } from '../../types';

export const getBundles = (state: IExchangeState) => state.bundlesState.bundles;

export const getShowBundleDetails = (state: IExchangeState) => state.bundlesState.showBundleDetails;
