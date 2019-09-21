import { IStoreState } from '../../types';
import { IUsersState } from './reducer';

export const getUsers = (state: IStoreState) => state.users.users;

export const getCurrentUser = (state: IStoreState) =>
    state.users.users.find(u => u.id.toLowerCase() === state.users.currentUserId.toLowerCase());

export const getUserById = (users: IUsersState['users'], id: string) =>
    users.find(u => u.id.toLowerCase() === id.toLowerCase());
