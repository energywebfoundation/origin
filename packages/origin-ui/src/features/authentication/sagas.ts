import { SagaIterator } from 'redux-saga';
import { take, all, fork, call, put, select } from 'redux-saga/effects';
import { Actions, IConfigurationUpdatedAction } from '../actions';
import { updateCurrentUserId } from '../users/actions';
import { getActiveAccount, getAccounts, getEncryptedAccounts } from './selectors';
import {
    IAccount,
    addAccount,
    AuthenticationActions,
    ISetActiveAccountAction,
    setActiveAccount,
    IImportAccountAction,
    IEncryptedAccount,
    addEncryptedAccount,
    IUnlockAccountAction
} from './actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';
import SimpleCrypto from 'simple-crypto-js';
import { showNotification, NotificationType } from '../../utils/notifications';

function privateKeyToAddress(
    privateKey: string,
    configuration: IStoreState['configuration']
): string {
    return configuration.blockchainProperties.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
}

function encryptString(plainText: string, password: string): string {
    const simpleCrypto = new SimpleCrypto(password);

    return simpleCrypto.encrypt(plainText);
}

function decryptString(encryptedText: string, password: string): string {
    const simpleCrypto = new SimpleCrypto(password);

    const decryptedText = simpleCrypto.decrypt(encryptedText);

    if (typeof decryptedText === 'string') {
        return decryptedText;
    }

    return null;
}

const ENCRYPTED_ACCOUNTS_STORAGE_KEY = 'AUTHENTICATION_ACCOUNTS';

function loadEncryptedAccountsFromStorage(): IEncryptedAccount[] {
    const stored = localStorage.getItem(ENCRYPTED_ACCOUNTS_STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
}

function encryptAndStoreAccount(account: IAccount, password: string) {
    if (!account.privateKey) {
        throw new Error(`Can't import account without private key`);
    }

    const storedAccounts = loadEncryptedAccountsFromStorage();

    if (storedAccounts.some(a => a.address.toLowerCase() === account.address)) {
        throw new Error(`Account ${account.address} already imported`);
    }

    const encryptedAccount: IEncryptedAccount = {
        address: account.address,
        encryptedPrivateKey: encryptString(account.privateKey, password)
    };

    storedAccounts.push(encryptedAccount);

    localStorage.setItem(ENCRYPTED_ACCOUNTS_STORAGE_KEY, JSON.stringify(storedAccounts));

    return encryptedAccount;
}

function* addDefaultWeb3Account(): SagaIterator {
    while (true) {
        const action: IConfigurationUpdatedAction = yield take(Actions.configurationUpdated);

        if (!action.conf || !(window as any).ethereum) {
            return;
        }

        try {
            const accounts: string[] = yield call(
                action.conf.blockchainProperties.web3.eth.getAccounts
            );

            yield put(
                addAccount({
                    address: accounts[0]
                })
            );
        } catch (error) {
            console.error('addDefaultWeb3Account() error', error);
        }
    }
}

function* setupDefaultActiveAccount(): SagaIterator {
    while (true) {
        yield take(AuthenticationActions.addAccount);

        const activeAccount: IAccount = yield select(getActiveAccount);
        const accounts: IAccount[] = yield select(getAccounts);

        if (accounts.length === 0) {
            yield put(setActiveAccount(null));
        } else if (!activeAccount || !activeAccount.privateKey) {
            yield put(setActiveAccount(accounts.find(a => a.privateKey) || accounts[0]));
        }
    }
}

function* applyActiveUser(): SagaIterator {
    while (true) {
        const action: ISetActiveAccountAction = yield take(AuthenticationActions.setActiveAccount);

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        configuration.blockchainProperties.activeUser = action.payload;

        try {
            yield put(updateCurrentUserId(action.payload.address));
        } catch (error) {
            console.error('applyActiveUser::UserDoesntExist', error);
        }
    }
}

function* importAccountSaga(): SagaIterator {
    while (true) {
        const action: IImportAccountAction = yield take(AuthenticationActions.importAccount);

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        try {
            const address = privateKeyToAddress(action.payload.privateKey, configuration);

            const encryptedAccounts: IEncryptedAccount[] = yield select(getEncryptedAccounts);

            if (encryptedAccounts.some(a => a.address.toLowerCase() === address)) {
                throw new Error(`Account ${address} already imported.`);
            }

            const account: IAccount = {
                address,
                privateKey: action.payload.privateKey
            };

            yield put(addAccount(account));

            const encryptedAccount = encryptAndStoreAccount(account, action.payload.password);

            yield put(addEncryptedAccount(encryptedAccount));

            showNotification('Successfully imported account', NotificationType.Success);
        } catch (error) {
            showNotification('Error while importing account', NotificationType.Error);

            console.error('importAccountSaga error while importing account', error);
        }
    }
}

function* loadEncryptedAccountsSaga(): SagaIterator {
    const encryptedAccounts = loadEncryptedAccountsFromStorage();

    for (const account of encryptedAccounts) {
        yield put(addEncryptedAccount(account));
    }
}

function* unlockAccountSaga(): SagaIterator {
    while (true) {
        const action: IUnlockAccountAction = yield take(AuthenticationActions.unlockAccount);

        const encryptedAccounts: IEncryptedAccount[] = yield select(getEncryptedAccounts);

        const account = encryptedAccounts.find(a => a.address === action.payload.address);

        if (!account) {
            throw new Error(`Account ${action.payload.address} not found in storage`);
        }

        const privateKey = decryptString(account.encryptedPrivateKey, action.payload.password);

        try {
            const unlockedAccount: IAccount = {
                address: action.payload.address,
                privateKey
            };

            yield put(addAccount(unlockedAccount));

            yield put(setActiveAccount(unlockedAccount));

            showNotification('Successfully unlocked account', NotificationType.Success);
        } catch (error) {
            showNotification('Error while unlocking account', NotificationType.Error);
            console.error('unlockAccountSaga error while unlocking account', error);
        }
    }
}

function* clearEncryptedAccountsSaga(): SagaIterator {
    while (true) {
        yield take(AuthenticationActions.clearEncryptedAccounts);

        localStorage.setItem(ENCRYPTED_ACCOUNTS_STORAGE_KEY, '');
    }
}

export function* authenticationSaga(): SagaIterator {
    yield all([
        fork(applyActiveUser),
        fork(setupDefaultActiveAccount),
        fork(addDefaultWeb3Account),
        fork(importAccountSaga),
        fork(loadEncryptedAccountsSaga),
        fork(unlockAccountSaga),
        fork(clearEncryptedAccountsSaga)
    ]);
}
