import { SagaIterator } from 'redux-saga';
import { take, all, fork, call, put, select } from 'redux-saga/effects';
import { Actions, IConfigurationUpdatedAction } from '../actions';
import { setActiveBlockchainAccountAddress } from '../users/actions';
import { getActiveAccount, getAccounts } from './selectors';
import {
    IAccount,
    addAccount,
    AuthenticationActions,
    ISetActiveAccountAction,
    setActiveAccount
} from './actions';
import { IStoreState } from '../../types';
import { getConfiguration } from '../selectors';

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

export function* authenticationSaga(): SagaIterator {
    yield all([
        fork(applyActiveUser),
        fork(setupDefaultActiveAccount),
        fork(addDefaultWeb3Account)
    ]);
}
