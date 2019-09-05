export enum ContractsActions {
    setOriginContractLookupAddress = 'CONTRACTS_SET_ORIGIN_CONTRACT_LOOKUP_ADDRESS'
}

export interface ISetOriginContractLookupAddressAction {
    type: ContractsActions.setOriginContractLookupAddress;
    payload: string;
}

export const setOriginContractLookupAddress = (
    payload: ISetOriginContractLookupAddressAction['payload']
) => ({
    type: ContractsActions.setOriginContractLookupAddress,
    payload
});

export type TSetOriginContractLookupAddress = typeof setOriginContractLookupAddress;

export type IContractsAction = ISetOriginContractLookupAddressAction;
