export enum ContractsActions {
    setMarketContractLookupAddress = 'CONTRACTS_SET_MARKET_CONTRACT_LOOKUP_ADDRESS',
    setCurrencies = 'MARKET_CURRENCIES'
}

export interface ISetMarketContractLookupAddressAction {
    type: ContractsActions.setMarketContractLookupAddress;
    payload: {
        address: string;
        userDefined?: boolean;
    };
}

export interface ISetCurrenciesAction {
    type: ContractsActions.setCurrencies;
    payload: {
        currencies: string[];
    };
}

export const setMarketContractLookupAddress = (
    payload: ISetMarketContractLookupAddressAction['payload']
) => ({
    type: ContractsActions.setMarketContractLookupAddress,
    payload
});

export const setCurrencies = (payload: ISetCurrenciesAction['payload']) => ({
    type: ContractsActions.setCurrencies,
    payload
});

export type TSetMarketContractLookupAddress = typeof setMarketContractLookupAddress;
export type TSetCurrencies = typeof setCurrencies;

export const MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY =
    'CONTRACTS_MARKET_CONTRACT_LOOKUP_ADDRESS';

export type IContractsAction = ISetMarketContractLookupAddressAction;
