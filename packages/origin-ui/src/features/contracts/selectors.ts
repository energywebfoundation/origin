import { IStoreState } from '../../types';

export const getMarketContractLookupAddress = (state: IStoreState): string =>
    state.contracts.marketContractLookupAddress;
