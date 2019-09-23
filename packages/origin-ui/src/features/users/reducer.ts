import { UsersActions, IUsersAction } from './actions';
import { User } from '@energyweb/user-registry';

export interface IUsersState {
    users: User.Entity[];
    currentUserId: string;
}

const defaultState: IUsersState = {
    users: [],
    currentUserId: null
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

        default:
            return state;
    }
}
