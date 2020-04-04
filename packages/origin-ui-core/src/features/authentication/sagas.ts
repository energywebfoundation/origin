import { SagaIterator } from 'redux-saga';
import { take, all, fork, call, put, select } from 'redux-saga/effects';
import { Actions, IConfigurationUpdatedAction } from '../actions';
import { setActiveBlockchainAccountAddress } from '../users/actions';
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
import { showNotification, NotificationType } from '../../utils/notifications';

function privateKeyToAddress(
    privateKey: string,
    configuration: IStoreState['configuration']
): string {
    return configuration.blockchainProperties.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
}

const ENCRYPTED_ACCOUNTS_STORAGE_KEY = 'AUTHENTICATION_ACCOUNTS';

function loadEncryptedAccountsFromStorage(): IEncryptedAccount[] {
    const stored = localStorage.getItem(ENCRYPTED_ACCOUNTS_STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
}

function isKeystore(privateKey: string): boolean {
    try {
        const parsed = JSON.parse(privateKey);

        return Boolean(parsed && parsed.address);
    } catch (error) {
        return false;
    }
}

function storeAccount(account: IEncryptedAccount) {
    const storedAccounts = loadEncryptedAccountsFromStorage();

    if (storedAccounts.some((a) => a.address.toLowerCase() === account.address.toLowerCase())) {
        throw new Error(`Account ${account.address} already imported`);
    }

    storedAccounts.push(account);

    localStorage.setItem(ENCRYPTED_ACCOUNTS_STORAGE_KEY, JSON.stringify(storedAccounts));
}

function encryptAndStoreAccount(
    account: IAccount,
    password: string,
    configuration: IStoreState['configuration']
) {
    if (!account.privateKey) {
        throw new Error(`Can't import account without private key`);
    }

    const encryptedAccount: IEncryptedAccount = {
        address: account.address,
        encryptedPrivateKey: configuration.blockchainProperties.web3.eth.accounts.encrypt(
            account.privateKey,
            password
        )
    };

    storeAccount(encryptedAccount);

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
            yield put(setActiveAccount(accounts.find((a) => a.privateKey) || accounts[0]));
        }
    }
}

function* applyActiveUser(): SagaIterator {
    while (true) {
        const action: ISetActiveAccountAction = yield take(AuthenticationActions.setActiveAccount);

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        if (configuration) {
            configuration.blockchainProperties.activeUser = action.payload;
        }

        try {
            yield put(setActiveBlockchainAccountAddress(action.payload.address));
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
            const encryptedAccounts: IEncryptedAccount[] = yield select(getEncryptedAccounts);

            const privateKey = action.payload.privateKey;
            let address: string;

            if (isKeystore(privateKey)) {
                const keystore = JSON.parse(privateKey);
                address = keystore.address.startsWith('0x')
                    ? keystore.address
                    : `0x${keystore.address}`;

                const unlockedKeystore = configuration.blockchainProperties.web3.eth.accounts.decrypt(
                    keystore,
                    action.payload.password
                );

                const account: IAccount = {
                    address,
                    privateKey: unlockedKeystore.privateKey
                };

                yield put(addAccount(account));

                const encryptedAccount: IEncryptedAccount = {
                    address,
                    encryptedPrivateKey: keystore
                };

                storeAccount(encryptedAccount);

                yield put(addEncryptedAccount(encryptedAccount));
            } else {
                address = privateKeyToAddress(privateKey, configuration);

                const account: IAccount = {
                    address,
                    privateKey: action.payload.privateKey
                };

                yield put(addAccount(account));

                const encryptedAccount = encryptAndStoreAccount(
                    account,
                    action.payload.password,
                    configuration
                );

                yield put(addEncryptedAccount(encryptedAccount));
            }

            if (
                address &&
                encryptedAccounts.some((a) => a.address.toLowerCase() === address.toLowerCase())
            ) {
                throw new Error(`Account ${address} already imported.`);
            }

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

        const account = encryptedAccounts.find((a) => a.address === action.payload.address);

        if (!account) {
            throw new Error(`Account ${action.payload.address} not found in storage`);
        }

        const configuration: IStoreState['configuration'] = yield select(getConfiguration);

        try {
            const decryptedAccount = configuration.blockchainProperties.web3.eth.accounts.decrypt(
                account.encryptedPrivateKey,
                action.payload.password
            );

            const unlockedAccount: IAccount = {
                address: action.payload.address.startsWith('0x')
                    ? action.payload.address
                    : `0x${action.payload.address}`,
                privateKey: decryptedAccount.privateKey
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
