import { call, put, delay, select, take, all, fork } from 'redux-saga/effects';
import { Configuration } from '@energyweb/utils-general';
import { SagaIterator } from 'redux-saga';
import { hideAccountChangedModal, showAccountChangedModal } from './actions';
import { getConfiguration } from '../selectors';
import { getAccountChangedModalVisible, getAccountChangedModalEnabled } from './selectors';
import { UsersActions } from '../users/actions';
import { isUsingInBrowserPK } from '../authentication/selectors';

function* showAccountChangedModalOnChange(): SagaIterator {
    while (true) {
        yield take(UsersActions.updateCurrentUserId);
        const conf: Configuration.Entity = yield select(getConfiguration);

        if (!conf) {
            return;
        }

        const initialAccounts: string[] = yield call(
            conf.blockchainProperties.web3.eth.getAccounts
        );

        while (true) {
            const accountChangedModalEnabled: boolean = yield select(getAccountChangedModalEnabled);
            const usingInBrowserPrivateKey: boolean = yield select(isUsingInBrowserPK);

            if (!accountChangedModalEnabled || usingInBrowserPrivateKey) {
                break;
            }

            const accountChangedModalVisible: boolean = yield select(getAccountChangedModalVisible);
            const accounts: string[] = yield call(conf.blockchainProperties.web3.eth.getAccounts);

            if (accountChangedModalVisible) {
                if (initialAccounts[0] === accounts[0]) {
                    yield put(hideAccountChangedModal());
                }
            } else if (initialAccounts[0] !== accounts[0]) {
                yield put(showAccountChangedModal());
            }

            yield delay(1000);
        }
    }
}

export function* generalSaga(): SagaIterator {
    yield all([fork(showAccountChangedModalOnChange)]);
}
