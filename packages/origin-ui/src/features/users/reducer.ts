import { UsersActions, IUsersAction, IUserFetcher } from './actions';
import { User } from '@energyweb/user-registry';
import { IStoreState } from '../../types';

export interface IUsersState {
    users: User.Entity[];
    currentUserId: string;
    fetcher: IUserFetcher;
}

const fetcher: IUserFetcher = {
    fetch: async (id: string, configuration: IStoreState['configuration']) =>
        configuration && new User.Entity(id, configuration).sync()
};

const defaultState: IUsersState = {
    users: [],
    currentUserId: null,
    fetcher
};

export default function reducer(state = defaultState, action: IUsersAction): IUsersState {
    switch (action.type) {
        case UsersActions.addUser:
            const exists = state.users.find(
                u => u.id.toLowerCase() === action.payload.id.toLowerCase()
            );

            if (exists) {
                return state;
            }

            return { ...state, users: [...state.users, action.payload] };

        case UsersActions.updateUser:
            const index = state.users.findIndex(
                u => u.id.toLowerCase() === action.payload.id.toLowerCase()
            );

            if (index === -1) {
                return state;
            }

            return {
                ...state,
                users: [
                    ...state.users.slice(0, index),
                    action.payload,
                    ...state.users.slice(index + 1)
                ]
            };
        case UsersActions.updateCurrentUserId:
            return {
                ...state,
                currentUserId: action.payload
            };

        case UsersActions.updateFetcher:
            return {
                ...state,
                fetcher: action.payload
            };

        default:
            return state;
    }
}
