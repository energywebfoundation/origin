export enum ContractsActions {
    setMarketContractLookupAddress = 'CONTRACTS_SET_MARKET_CONTRACT_LOOKUP_ADDRESS'
}

export interface ISetMarketContractLookupAddressAction {
    type: ContractsActions.setMarketContractLookupAddress;
    payload: {
        address: string;
        userDefined?: boolean;
    };
}

export const setMarketContractLookupAddress = (
    payload: ISetMarketContractLookupAddressAction['payload']
) => ({
    type: ContractsActions.setMarketContractLookupAddress,
    payload
});

export type TSetMarketContractLookupAddress = typeof setMarketContractLookupAddress;

export const MARKET_CONTRACT_LOOKUP_ADDRESS_STORAGE_KEY =
    'CONTRACTS_MARKET_CONTRACT_LOOKUP_ADDRESS';

export type IContractsAction = ISetMarketContractLookupAddressAction;
