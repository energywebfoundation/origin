import { IStoreState } from '../types';
import { getOriginContractLookupAddress } from './contracts/selectors';

export const getConfiguration = (state: IStoreState) => state.configuration;

export const getCurrentUser = (state: IStoreState) => state.currentUser;

export const getBaseURL = (state: IStoreState) => {
    return constructBaseURL(getOriginContractLookupAddress(state));
}

export const constructBaseURL = (originContractLookupAddress: string) => {
    return `/${originContractLookupAddress}`;
}