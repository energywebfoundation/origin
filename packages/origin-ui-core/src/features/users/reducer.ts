import { IUserWithRelations } from '@energyweb/origin-backend-core';

import { UsersActions, IUsersAction } from './actions';

export interface IUsersState {
    activeBlockchainAccountAddress: string;
    userOffchain: IUserWithRelations;
}

const defaultState: IUsersState = {
    activeBlockchainAccountAddress: null,
    userOffchain: null
};

export default function reducer(state = defaultState, action: IUsersAction): IUsersState {
    switch (action.type) {
        case UsersActions.setActiveBlockchainAccountAddress:
            return {
                ...state,
                activeBlockchainAccountAddress: action.payload
            };

        case UsersActions.setUserOffchain:
            return {
                ...state,
                userOffchain: action.payload
            };

        default:
            return state;
    }
}
