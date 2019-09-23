import { IStoreState } from '../../types';
import { IUsersState } from './reducer';

export const getUsers = (state: IStoreState) => state.users.users;

export const getCurrentUser = (state: IStoreState) => {
    const currentUserId = state.users.currentUserId;

    if (currentUserId) {
        return state.users.users.find(u => u.id.toLowerCase() === currentUserId.toLowerCase());
    }
};

export const getUserById = (users: IUsersState['users'], id: string) =>
    users.find(u => u.id.toLowerCase() === id.toLowerCase());
