import { AuthenticationActions, IAuthenticationAction, IAccount } from './actions';

export interface IAuthenticationState {
    accounts: IAccount[];
    activeAccount: IAccount;
}

const defaultState: IAuthenticationState = {
    accounts: [],
    activeAccount: null
};

export default function reducer(
    state = defaultState,
    action: IAuthenticationAction
): IAuthenticationState {
    switch (action.type) {
        case AuthenticationActions.addAccount:
            return { ...state, accounts: [...state.accounts, action.payload] };

        case AuthenticationActions.setActiveAccount:
            return { ...state, activeAccount: action.payload };

        default:
            return state;
    }
}
