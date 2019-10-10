import {
    AuthenticationActions,
    IAuthenticationAction,
    IAccount,
    IEncryptedAccount
} from './actions';

export interface IAuthenticationState {
    accounts: IAccount[];
    activeAccount: IAccount;
    encryptedAccounts: IEncryptedAccount[];
}

const defaultState: IAuthenticationState = {
    accounts: [],
    activeAccount: null,
    encryptedAccounts: []
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

        case AuthenticationActions.addEncryptedAccount:
            return { ...state, encryptedAccounts: [...state.encryptedAccounts, action.payload] };

        case AuthenticationActions.clearEncryptedAccounts:
            return { ...state, encryptedAccounts: [] };

        default:
            return state;
    }
}
