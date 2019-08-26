import { IStoreState } from '../../types';

export const getOriginContractLookupAddress = (state: IStoreState): string =>
    state.contracts.originContractLookupAddress;
