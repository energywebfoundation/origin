import { IStoreState } from '../../types';

export const getActiveBlockchainAccountAddress = (state: IStoreState) =>
    state.users.activeBlockchainAccountAddress;

export const getUserOffchain = (state: IStoreState) => state.users.userOffchain;

export const getIsLeadUser = (state: IStoreState): boolean => {
    const user = getUserOffchain(state);

    if (!user) {
        return false;
    }

    return user.organization?.leadUser === user.id;
};
