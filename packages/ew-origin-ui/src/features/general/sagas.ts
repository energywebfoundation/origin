import { call, put, delay, select, take, all, fork } from 'redux-saga/effects'
import { Configuration } from 'ew-utils-general-lib';
import { SagaIterator } from 'redux-saga';
import { Actions } from '../actions';
import { hideAccountChangedModal, showAccountChangedModal } from './actions';
import { getConfiguration } from '../selectors';
import { getAccountChangedModalVisible, getAccountChangedModalEnabled } from './selectors';

function* showAccountChangedModalOnChange(): SagaIterator {
  while (true) {
    yield take(Actions.currentUserUpdated);
    const conf: Configuration.Entity = yield select(getConfiguration);
    const initialAccounts: string[] = yield call(conf.blockchainProperties.web3.eth.getAccounts);

    while (true) {
      const accountChangedModalEnabled: boolean = yield select(getAccountChangedModalEnabled);

      if (!accountChangedModalEnabled) {
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
  yield all([
    fork(showAccountChangedModalOnChange)
  ]);
}