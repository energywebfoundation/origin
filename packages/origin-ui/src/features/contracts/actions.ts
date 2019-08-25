export enum ContractsActions {
    setOriginContractLookupAddress = 'CONTRACTS_SET_ORIGIN_CONTRACT_LOOKUP_ADDRESS'
}

export interface TSetOriginContractLookupAddressAction {
    type: ContractsActions.setOriginContractLookupAddress;
    payload: string;
}

export type TSetOriginContractLookupAddress = typeof setOriginContractLookupAddress;

export const setOriginContractLookupAddress = (
    payload: TSetOriginContractLookupAddressAction['payload']
) => ({
    type: ContractsActions.setOriginContractLookupAddress,
    payload
});

export type IContractsAction = TSetOriginContractLookupAddressAction;
