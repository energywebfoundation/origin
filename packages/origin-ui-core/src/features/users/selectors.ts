import { IStoreState } from '../../types';
import { IUsersState } from './reducer';

export const getUsers = (state: IStoreState) => state.users.users;

export const getCurrentUser = (state: IStoreState) => {
    const currentUserId = state.users.currentUserId;

    if (currentUserId) {
        return state.users.users.find(u => u.id.toLowerCase() === currentUserId.toLowerCase());
    }
};

export const getCurrentUserId = (state: IStoreState) => state.users.currentUserId;

export const getUserById = (users: IUsersState['users'], id: string) => {
    if (typeof id === 'undefined') {
        return;
    }

    return users.find(u => u.id.toLowerCase() === id.toLowerCase());
};

export const getUserFetcher = (state: IStoreState) => state.users.fetcher;

export const getUserOffchain = (state: IStoreState) => state.users.userOffchain;

export const getIsLeadUser = (state: IStoreState): boolean => {
    const user = getUserOffchain(state);

    if (!user) {
        return false;
    }

    return user.organization?.leadUser === user.id;
};
