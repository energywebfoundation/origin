export enum ContractsActions {
    setMarketContractLookupAddress = 'CONTRACTS_SET_MARKET_CONTRACT_LOOKUP_ADDRESS'
}

export interface ISetMarketContractLookupAddressAction {
    type: ContractsActions.setMarketContractLookupAddress;
    payload: {
        address: string;
    };
}

export const setMarketContractLookupAddress = (
    payload: ISetMarketContractLookupAddressAction['payload']
) => ({
    type: ContractsActions.setMarketContractLookupAddress,
    payload
});

export type TSetMarketContractLookupAddress = typeof setMarketContractLookupAddress;

export type IContractsAction = ISetMarketContractLookupAddressAction;
